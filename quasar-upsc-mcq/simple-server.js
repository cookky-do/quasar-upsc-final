// Simple mock API server for local development
// Uses CommonJS + CORS so it runs cleanly with `node simple-server.js`
const express = require('express')
const cors = require('cors')

const app = express()

// Allow frontend (Vite dev server etc.) to call this API
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(express.json())

app.post('/api/generate', async (req, res) => {
  try {
    console.log('Mock API called with:', req.body)
    return res.json({
      book_name: 'Indian Polity',
      chapter_name: 'Fundamental Rights',
      concept_source: 'Writs',
      paragraph_number: 1,
      questions: [
        {
          question:
            'Consider the following statements about Writs:\n1. Habeas Corpus is related to personal liberty\n2. Mandamus is issued to a public authority\n3. Prohibition can be issued only against courts\n\nWhich of the above statements is/are correct?',
          options: [
            'A. 1 only',
            'B. 1 and 2 only',
            'C. 2 and 3 only',
            'D. 1, 2 and 3',
          ],
          answer: 'B',
          explanation:
            'Habeas Corpus protects personal liberty (1 is correct). Mandamus is issued to public authorities (2 is correct). Prohibition can be issued against courts and tribunals (3 is wrong).',
          memory_trick:
            'HMP - Habeas Corpus (personal), Mandamus (authority), Prohibition (courts)',
        },
      ],
    })
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'API failed' })
  }
})

const port = 8787
app.listen(port, () => {
  console.log(`Simple server running on port ${port}`)
})
