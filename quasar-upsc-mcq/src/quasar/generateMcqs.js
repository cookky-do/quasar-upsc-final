// Simple API call - FINAL VERSION
function getApiBaseUrl() {
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
  if (payload.questions.length < 1) throw new Error('Expected at least 1 question')
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

export async function generateMcqsFromBookIndex({ bookName, chapterName, topic = '', paragraphNumber }) {
  const baseUrl = getApiBaseUrl()
  const cacheBuster = Date.now() // Force no cache
  console.log('Calling API:', `${baseUrl}/api/generate?t=${cacheBuster}`)
  
  const res = await fetch(`${baseUrl}/api/generate?t=${cacheBuster}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookName,
      chapterName,
      topic,
      paragraphNumber,
    }),
  })

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} - ${res.statusText}`)
  }

  const data = await res.json()
  console.log('API Response:', data)
  return data
}

export async function generatePracticeMcqs({ book_name, chapter_name, concept_source, paragraph_number }) {
  return generateMcqsFromBookIndex({
    bookName: book_name,
    chapterName: chapter_name,
    topic: concept_source,
    paragraphNumber: paragraph_number
  })
}

export async function generateMcqsFromExtractedText({ paragraphText, paragraphIndex = 0 }) {
  const cleanText = requireString(paragraphText, 'paragraphText')
  const idx = typeof paragraphIndex === 'number' ? paragraphIndex : Number(paragraphIndex)
  if (!Number.isFinite(idx) || idx < 0) throw new Error('Invalid paragraphIndex')

  const baseUrl = getApiBaseUrl()
  console.log('Calling API:', baseUrl)
  
  const res = await fetch(`${baseUrl}/api/generate/from-text`, {
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

