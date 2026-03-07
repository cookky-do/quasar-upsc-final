export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { bookName, chapterName, topic = '', paragraphNumber } = req.body

    // Validate input
    if (!bookName || !chapterName || !paragraphNumber) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { bookName, chapterName, topic, paragraphNumber }
      })
    }

    // Check API key
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' })
    }

    // Dynamic import to avoid bundling issues
    const { default: Groq } = await import('groq-sdk')
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const prompt = `Generate 3 UPSC MCQs about ${bookName} - ${chapterName}, topic: ${topic}, paragraph ${paragraphNumber}.

Return ONLY this JSON format:
{
  "book_name": "${bookName}",
  "chapter_name": "${chapterName}",
  "concept_source": "${topic}",
  "paragraph_number": ${paragraphNumber},
  "questions": [
    {
      "question": "Question text with A. B. C. D. options",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "answer": "A",
      "explanation": "Why this is correct",
      "memory_trick": "Memory aid"
    }
  ]
}`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = completion.choices[0].message.content
    
    // Clean and parse JSON
    let cleaned = content.replace(/```json\n?|\n?```/g, '').trim()
    
    // Try to extract JSON if there's extra text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleaned = jsonMatch[0]
    }

    const parsed = JSON.parse(cleaned)
    
    return res.json(parsed)

  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Failed to generate questions',
      details: error.message 
    })
  }
}
