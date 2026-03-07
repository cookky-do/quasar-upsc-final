export default async function handler(req, res) {
  // CORS
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

    // Return mock data for now to test if API works
    return res.json({
      book_name: bookName || "Test Book",
      chapter_name: chapterName || "Test Chapter", 
      concept_source: topic || "Test Topic",
      paragraph_number: paragraphNumber || 1,
      questions: [
        {
          question: "Consider the following statements about Fundamental Rights:\n1. They are enforceable by courts\n2. They cannot be suspended during emergency\n3. They are absolute rights\n\nWhich of the above statements is/are correct?",
          options: [
            "A. 1 only",
            "B. 1 and 2 only", 
            "C. 2 and 3 only",
            "D. 1, 2 and 3"
          ],
          answer: "A",
          explanation: "Fundamental Rights are enforceable by courts (statement 1 is correct). They can be suspended during emergency (statement 2 is wrong). They are not absolute and subject to reasonable restrictions (statement 3 is wrong).",
          memory_trick: "FAR - Fundamental rights are Fair, Absolute? No, Reasonable restrictions"
        }
      ]
    })

  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
