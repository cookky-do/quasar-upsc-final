import { Groq } from 'groq-sdk'

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { bookName, chapterName, topic = '', paragraphNumber } = req.body

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' })
    }

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
    const cleaned = content.replace(/```json\n?|\n?```/g, '').trim()
    
    // Extract JSON from response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    const jsonString = jsonMatch ? jsonMatch[0] : cleaned
    
    return res.json(JSON.parse(jsonString))

  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Failed to generate questions',
      details: error.message 
    })
  }
}
