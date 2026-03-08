const express = require('express');
const cors = require('cors');

const app = express();

// CORS for all origins
app.use(cors({
  origin: ['https://quasar-upsc-mcq.vercel.app', 'http://localhost:5176', 'http://localhost:5175'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'UPSC MCQ API is running!' });
});

app.post('/api/generate', (req, res) => {
  console.log('API called:', req.body);
  res.json({
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
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
