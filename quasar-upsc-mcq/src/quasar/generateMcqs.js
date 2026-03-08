// Get API base URL based on environment
function getApiBaseUrl() {
  // Use Render backend for production
  return 'https://quasar-upsc-final-1.onrender.com'
}

function stripCodeFences(text) {
  if (typeof text !== 'string') return ''
  return text
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
}

function requireString(v, name) {
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Invalid ${name}`)
  return v.trim()
}

function validatePracticePayload(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Invalid payload')
  requireString(payload.book_name, 'book_name')
  requireString(payload.chapter_name, 'chapter_name')
  requireString(payload.concept_source, 'concept_source')
  if (typeof payload.paragraph_number !== 'number' || payload.paragraph_number < 0) {
    throw new Error('Invalid paragraph_number')
  }
  if (!Array.isArray(payload.questions)) throw new Error('Invalid questions')
  if (payload.questions.length < 3) throw new Error('Expected at least 3 questions')
  if (payload.questions.length > 3) payload.questions = payload.questions.slice(0, 3)

  payload.questions.forEach((q, idx) => {
    if (!q || typeof q !== 'object') throw new Error(`Invalid question at ${idx}`)
    requireString(q.question, `question[${idx}]`)
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Expected 4 options at ${idx}`)
    }
    q.options.forEach((opt, oIdx) => requireString(opt, `options[${idx}][${oIdx}]`))
    const ans = requireString(q.answer, `answer[${idx}]`).toUpperCase()
    if (!['A', 'B', 'C', 'D'].includes(ans)) throw new Error(`Invalid answer at ${idx}`)
    q.answer = ans
    requireString(q.explanation, `explanation[${idx}]`)
    requireString(q.memory_trick, `memory_trick[${idx}]`)
  })

  return payload
}

export async function generatePracticeMcqs({ bookName, chapterName, topic, paragraphNumber }) {
  const cleanBook = requireString(bookName, 'bookName')
  const cleanChapter = requireString(chapterName, 'chapterName')
  const para = typeof paragraphNumber === 'number' ? paragraphNumber : Number(paragraphNumber)
  if (!Number.isFinite(para) || para < 1) throw new Error('Invalid paragraphNumber')

  const res = await fetch(`${getApiBaseUrl()}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookName: cleanBook,
      chapterName: cleanChapter,
      topic: typeof topic === 'string' ? topic : '',
      paragraphNumber: para,
    }),
  })

  if (!res.ok) {
    throw new Error(
      'API not available on Vercel. To use the app:\n\n' +
      '1. Open PowerShell Terminal 1:\n' +
      '   cd c:\\Users\\ATC\\Desktop\\final\\quasar-upsc-mcq\n' +
      '   $env:GROQ_API_KEY=\x27[your-groq-api-key]\x27\n' +
      '   npm run api\n\n' +
      '2. Open PowerShell Terminal 2:\n' +
      '   cd c:\\Users\\ATC\\Desktop\\final\\quasar-upsc-mcq\n' +
      '   npm run dev\n\n' +
      '3. Visit https://quasar-upsc-final.onrender.com' +
      'Rest API works perfectly when run locally!'
    )
  }
  const data = await res.json()
  return validatePracticePayload(data)
}

export async function generateMcqsFromExtractedText({ paragraphText, paragraphIndex = 0 }) {
  const cleanText = requireString(paragraphText, 'paragraphText')
  const idx = typeof paragraphIndex === 'number' ? paragraphIndex : Number(paragraphIndex)
  if (!Number.isFinite(idx) || idx < 0) throw new Error('Invalid paragraphIndex')

  const res = await fetch(`${getApiBaseUrl()}/api/generate/from-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paragraphText: cleanText,
      paragraphIndex: idx,
    }),
  })

  if (!res.ok) {
    throw new Error(
      'API not available on Vercel. To use the app:\n\n' +
      '1. Open PowerShell Terminal 1:\n' +
      '   cd c:\\Users\\ATC\\Desktop\\final\\quasar-upsc-mcq\n' +
      '   $env:GROQ_API_KEY=\x27[your-groq-api-key]\x27\n' +
      '   npm run api\n\n' +
      '2. Open PowerShell Terminal 2:\n' +
      '   cd c:\\Users\\ATC\\Desktop\\final\\quasar-upsc-mcq\n' +
      '   npm run dev\n\n' +
      '3. Visit https://quasar-upsc-final.onrender.com\n' +
      'Rest API works perfectly when run locally!'
    )
  }
  const data = await res.json()
  return validatePracticePayload(data)
}

