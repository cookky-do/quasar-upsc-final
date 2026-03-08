// FINAL CORS FIX - Guaranteed to work
const express = require('express');
const cors = require('cors');

const app = express();

// CORS BEFORE everything else - most permissive
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: true,
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.send(200);
});

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ message: 'UPSC MCQ API is running!' });
});

// API route
app.post('/api/generate', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  console.log('API called:', req.body);
  
  const response = {
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
  };
  
  res.json(response);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`FINAL API running on port ${PORT}`);
});
