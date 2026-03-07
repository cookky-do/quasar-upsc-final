module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const Groq = (await import('groq-sdk')).default
    
    function stripCodeFences(text) {
      if (typeof text !== 'string') return ''
      return text
        .replace(/^\s*```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim()
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

    const groqKey = process.env.GROQ_API_KEY
    if (!groqKey) {
      return res.status(500).json({ error: 'Missing GROQ_API_KEY on server' })
    }

    const paragraphText = requireString(req.body?.paragraphText, 'paragraphText')
    const paragraphIndex = req.body?.paragraphIndex
    if (typeof paragraphIndex !== 'number' || paragraphIndex < 0) {
      return res.status(400).json({ error: 'Invalid paragraphIndex' })
    }

    const prompt = `You are an expert UPSC examiner. Generate 3 authentic UPSC Prelims-style MCQ questions ONLY from the paragraph below.

PARAGRAPH TO EXAMINE:
${paragraphText}

IMPORTANT: Use DIFFERENT question patterns for each question. Choose from these authentic UPSC patterns:

1. STATEMENT BASED: "Consider the following statements..." with (a) 1 only (b) 1 and 2 only (c) 2 and 3 only (d) 1,2,3
2. ASSERTION-REASON (A-R): "Assertion (A): [fact]\\nReason (R): [explanation]" with standard A-R options
3. CORRECT/INCORRECT PAIR MATCHING: "Which of the following pairs is/are correctly matched?"
4. DIRECT FACTUAL: Straightforward definition/fact-based question
5. WHICH ONE IS NOT/INCORRECT: "Which of the following is NOT correct?"
6. CAUSE & EFFECT: "X happened because of Y – is this correct?"
7. EXCEPTION BASED: "All of the following are examples of X EXCEPT:"
8. LIST MATCHING: "Match List I with List II:" with (a), (b), (c), (d) combinations
9. INFERENCE/CONCLUSION: "Based on the passage, which conclusion is correct?"

Rules:
- Questions MUST be based ONLY on the given paragraph
- Each question uses DIFFERENT pattern
- Conceptual and challenging
- Test understanding and application
- Make UPSC Prelims standard difficulty

Respond as JSON with this exact structure:
{
  "paragraph_number": ${paragraphIndex},
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
- options MUST be an ARRAY of 4  strings (not object): ["A. ...", "B. ...", "C. ...", "D. ..."]
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

    // Add required fields for consistency with manual mode validation
    if (!parsed.book_name) parsed.book_name = 'OCR Extracted'
    if (!parsed.chapter_name) parsed.chapter_name = 'OCR Content'
    if (!parsed.concept_source) parsed.concept_source = 'Extracted from Image'
    if (typeof parsed.paragraph_number !== 'number') parsed.paragraph_number = paragraphIndex

    return res.json(parsed)
  } catch (e) {
    console.error('[/api/generate/from-text] Error:', e?.message || String(e), e)
    return res.status(500).json({ error: `Generation failed: ${e?.message || 'Unknown'}` })
  }
}
