// Get API base URL based on environment (local dev, Vercel, Render, etc.)
function getApiBaseUrl() {
  // 1. Explicit override via Vite env, if provided
  try {
    // This will be tree-shaken away in non-Vite environments
    // eslint-disable-next-line no-undef
    const explicit = import.meta?.env?.VITE_API_BASE_URL
    if (typeof explicit === 'string' && explicit.trim()) {
      console.log('Using VITE_API_BASE_URL:', explicit.trim())
      return explicit.trim()
    }
  } catch {
    // ignore – import.meta may not exist outside Vite
  }

  if (typeof window !== 'undefined') {
    const origin = window.location.origin || ''

    // 2. Local development: use the simple mock API server
    if (origin.includes('localhost')) {
      const localApi = 'http://localhost:8787'
      console.log('Using local API:', localApi)
      return localApi
    }

    // 3. Vercel frontend → talk to Render backend
    if (origin.includes('vercel.app')) {
      const renderBase = 'https://quasar-upsc-final-1.onrender.com'
      console.log('Using Render API for Vercel frontend:', renderBase)
      return renderBase
    }

    // 4. Frontend itself hosted on Render – use same origin
    if (origin.includes('onrender.com')) {
      console.log('Using same-origin Render API:', origin)
      return origin
    }

    // 5. Fallback to same-origin for any other host
    if (origin) {
      console.log('Using origin API:', origin)
      return origin
    }
  }

  // 6. Final safety fallback – public Render backend
  const fallback = 'https://quasar-upsc-final-1.onrender.com'
  console.log('Using fallback Render API:', fallback)
  return fallback
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

