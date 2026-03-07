export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'POST' && req.url === '/api/test') {
    return res.json({ 
      message: 'Test API working!',
      hasKey: !!process.env.GROQ_API_KEY,
      timestamp: new Date().toISOString()
    })
  }

  if (req.method === 'POST' && req.url === '/api/generate') {
    try {
      if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: 'Missing GROQ_API_KEY' })
      }

      const { default: Groq } = await import('groq-sdk')
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

      const { bookName, chapterName, topic = '', paragraphNumber } = req.body

      const prompt = `Generate 3 UPSC MCQs about ${bookName} - ${chapterName}, topic: ${topic}, paragraph ${paragraphNumber}. Return JSON format with questions array containing question, options, answer, explanation.`

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = completion.choices[0].message.content
      return res.json({ 
        book_name: bookName,
        chapter_name: chapterName,
        concept_source: topic,
        paragraph_number: paragraphNumber,
        questions: JSON.parse(content.replace(/```json\n?|\n?```/g, ''))
      })

    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(404).json({ error: 'Not found' })
}
