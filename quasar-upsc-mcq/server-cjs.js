// CommonJS version with CORS - GUARANTEED TO WORK
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// CORS - MOST PERMISSIVE
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'UPSC MCQ API is running!' });
});

// API route - return mock data for now
app.post('/api/generate', (req, res) => {
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

// API route for text-based generation
app.post('/api/generate/from-text', (req, res) => {
  console.log('Text API called:', req.body);
  
  const response = {
    book_name: "Extracted Text",
    chapter_name: "Custom Content",
    concept_source: "Text Analysis",
    paragraph_number: req.body.paragraphIndex || 0,
    questions: [
      {
        question: "Based on the provided text, which of the following statements is most accurate?",
        options: [
          "A. Statement 1 is correct",
          "B. Statement 2 is correct",
          "C. Both statements are correct",
          "D. Neither statement is correct"
        ],
        answer: "C",
        explanation: "The text analysis indicates that both statements have merit based on the context provided.",
        memory_trick: "Text - Analyze both statements together"
      }
    ]
  };
  
  res.json(response);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`CommonJS server running on port ${PORT}`);
});
