module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const groqKey = process.env.GROQ_API_KEY
    if (!groqKey) {
      return res.status(500).json({ error: 'Missing GROQ_API_KEY' })
    }

    // Use dynamic import for ESM module
    const { default: Groq } = await import('groq-sdk')
    
    function stripCodeFences(text) {
      if (typeof text !== 'string') return ''
      return text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
    }

    function tryExtractJsonObject(text) {
      const s = typeof text === 'string' ? text : ''
      const start = s.indexOf('{')
      const end = s.lastIndexOf('}')
      if (start === -1 || end === -1 || end <= start) return null
      return s.slice(start, end + 1)
    }

    function requireString(v, name) {
      if (typeof v !== 'string' || !v.trim()) throw new Error(`Invalid ${name}`)
      return v.trim()
    }

    const bookName = requireString(req.body?.bookName, 'bookName')
    const chapterName = requireString(req.body?.chapterName, 'chapterName')
    const topic = typeof req.body?.topic === 'string' ? req.body.topic : ''
    const paragraphNumberRaw = req.body?.paragraphNumber
    const paragraphNumber = typeof paragraphNumberRaw === 'number' ? paragraphNumberRaw : Number(paragraphNumberRaw)

    if (!Number.isFinite(paragraphNumber) || paragraphNumber < 1) {
      return res.status(400).json({ error: 'Invalid paragraphNumber' })
    }

    const prompt = `You are an expert UPSC examiner. Generate 3 authentic UPSC Prelims-style MCQ questions based on:

Book: ${bookName}
Chapter: ${chapterName}
Topic: ${topic}

IMPORTANT: Use DIFFERENT question patterns for each question. Choose from these authentic UPSC patterns:

1. STATEMENT BASED: "Consider the following statements..." with (a) 1 only (b) 1 and 2 only (c) 2 and 3 only (d) 1,2,3
2. ASSERTION-REASON (A-R): "Assertion (A): [fact]\\nReason (R): [explanation]" with standard A-R options
3. CORRECT/INCORRECT PAIR MATCHING: "Which of the following pairs is/are correctly matched?"
4. DIRECT FACTUAL: Straightforward definition/fact-based question
5. WHICH ONE IS NOT/INCORRECT: "Which of the following is NOT correct?"
6. CAUSE & EFFECT: "X happened because of Y – is this correct?"
7. EXCEPTION BASED: "All of the following are examples of X EXCEPT:"
8. LIST MATCHING: "Match List I with List II:" with (a), (b), (c), (d) combinations

Rules:
- Each question uses DIFFERENT pattern
- Conceptual and challenging
- Focus on understanding, not memorization
- Test application of concepts

Respond as JSON with this exact structure:
{
  "book_name": "${bookName}",
  "chapter_name": "${chapterName}",
  "concept_source": "${topic || 'General'}",
  "paragraph_number": ${paragraphNumber},
  "questions": [
    {
      "question": "Full question text here\\nA. Option A\\nB. Option B\\nC. Option C\\nD. Option D",
      "options": ["A. Option A", "B. Option B", "C. Option C", "D. Option D"],
      "answer": "A",
      "explanation": "Why this is correct...",
      "memory_trick": "How to remember..."
    },
    {second question...},
    {third question...}
  ]
}

STRICT REQUIREMENTS FOR JSON:
- options MUST be an ARRAY of 4 strings (not object): ["A. ...", "B. ...", "C. ...", "D. ..."]
- answer MUST be single letter A, B, C, or D (not "A." or full text)
- Return ONLY JSON, no markdown, no explanations before/after`

    const groq = new Groq({ apiKey: groqKey })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = completion?.choices?.[0]?.message?.content || ''
    const cleaned = stripCodeFences(content)

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      const extracted = tryExtractJsonObject(cleaned)
      if (!extracted) {
        return res.status(502).json({ error: 'Model did not return JSON' })
      }
      try {
        parsed = JSON.parse(extracted)
      } catch {
        return res.status(502).json({ error: 'Model returned invalid JSON' })
      }
    }

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return res.status(502).json({ error: 'Invalid response structure: missing questions' })
    }
    if (parsed.questions.length < 3) {
      return res.status(502).json({ error: 'Expected at least 3 questions' })
    }

    return res.json(parsed)
  } catch (e) {
    console.error('[/api/generate] Error:', e?.message || String(e), e.stack)
    return res.status(500).json({ error: 'Generation failed', details: e?.message })
  }
}
