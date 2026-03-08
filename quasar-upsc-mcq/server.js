import dotenv from 'dotenv'
import express from 'express'
import Groq from 'groq-sdk'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '.env')
dotenv.config({ path: envPath })

const app = express()

// CORS configuration - MOST PERMISSIVE
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}))

app.use(express.json({ limit: '1mb' }))

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

// Mock API for testing
app.post('/api/generate', async (req, res) => {
  try {
    console.log('Mock API /api/generate called')
    return res.json({
      book_name: "Indian Polity",
      chapter_name: "Fundamental Rights", 
      concept_source: "Writs",
      paragraph_number: 1,
      questions: [
        {
          question: "Consider the following statements about Writs:\n1. Habeas Corpus is related to personal liberty\n2. Mandamus is issued to a public authority\n3. Prohibition can be issued only against courts\n\nWhich of the above statements is/are correct?",
          options: [
            "A. 1 only",
            "B. 1 and 2 only", 
            "C. 2 and 3 only",
            "D. 1, 2 and 3"
          ],
          answer: "B",
          explanation: "Habeas Corpus protects personal liberty (1 is correct). Mandamus is issued to public authorities (2 is correct). Prohibition can be issued against courts and tribunals (3 is wrong).",
          memory_trick: "HMP - Habeas Corpus (personal), Mandamus (authority), Prohibition (courts)"
        }
      ]
    })
  } catch (error) {
    console.error('[Mock API Error]:', error)
    res.status(500).json({ error: 'Mock API failed' })
  }
})

// Original API (commented out for testing)
// app.post('/api/generate', async (req, res) => {
  try {
    const groqKey = process.env.GROQ_API_KEY
    if (!groqKey) {
      return res.status(500).json({ error: 'Missing GROQ_API_KEY on server' })
    }

    const bookName = requireString(req.body?.bookName, 'bookName')
    const chapterName = requireString(req.body?.chapterName, 'chapterName')
    const topic = typeof req.body?.topic === 'string' ? req.body.topic : ''
    const paragraphNumberRaw = req.body?.paragraphNumber
    const paragraphNumber =
      typeof paragraphNumberRaw === 'number' ? paragraphNumberRaw : Number(paragraphNumberRaw)

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

    return res.json(parsed)
  } catch (e) {
    console.error('[/api/generate] Error:', e?.message || String(e))
    return res.status(500).json({ error: `Generation failed: ${e?.message || 'Unknown'}` })
  }
})

app.post('/api/generate/from-text', async (req, res) => {
  try {
    const groqKey = process.env.GROQ_API_KEY
    if (!groqKey) {
      return res.status(500).json({ error: 'Missing GROQ_API_KEY on server' })
    }

    const paragraphText = requireString(req.body?.paragraphText, 'paragraphText')
    const paragraphIndex = req.body?.paragraphIndex
    if (typeof paragraphIndex !== 'number' || paragraphIndex < 0) {
      return res.status(400).json({ error: 'Invalid paragraphIndex' })
    }

    // For extracted text, we treat it as a direct source
    // Return same structure as manual mode for consistency
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

    // Add required fields for consistency with manual mode validation
    if (!parsed.book_name) parsed.book_name = 'OCR Extracted'
    if (!parsed.chapter_name) parsed.chapter_name = 'OCR Content'
    if (!parsed.concept_source) parsed.concept_source = 'Extracted from Image'
    if (typeof parsed.paragraph_number !== 'number') parsed.paragraph_number = paragraphIndex

    return res.json(parsed)
  } catch (e) {
    console.error('[/api/generate/from-text] Error:', e?.message || String(e))
    return res.status(500).json({ error: `Generation failed: ${e?.message || 'Unknown'}` })
  }
})

app.use((err, req, res, next) => {
  console.error('[Server Error]:', err?.message || String(err), err?.stack)
  res.status(500).json({ error: err?.message || 'Internal server error' })
})

const port = Number(process.env.PORT || 8787)
app.listen(port, () => {
  // Intentionally minimal logs for MVP.
})

