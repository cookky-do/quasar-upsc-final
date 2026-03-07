# 🎯 QUASAR - AI UPSC Prelims MCQ Generator

**AI-powered UPSC Prelims MCQ Generator with Image OCR and Pattern-based Questions**

## ⚡ Quick Start (2 Steps)

### Step 1: Start the Backend API
```powershell
cd c:\Users\ATC\Desktop\final\quasar-upsc-mcq
$env:GROQ_API_KEY='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'
npm run api
```
Wait for: `✅ Server running on http://localhost:8787`

### Step 2: Open the App in Another Terminal
```powershell
cd c:\Users\ATC\Desktop\final\quasar-upsc-mcq
npm run dev
```
Wait for: `http://localhost:5173` then click the link

## ✨ Features

✅ **Manual Mode**: Select Book → Chapter → Topic → Generate authentic UPSC questions  
✅ **OCR Mode**: Upload question images → Extract text → Generate questions  
✅ **9 UPSC Patterns**: Statement-based, A-R, Matching, Factual, Exception, Cause-Effect, etc.  
✅ **AI-Powered**: Uses Groq's Llama 3.3 70B for authentic questions  
✅ **Beautiful UI**: Dark gradient theme with responsive design  
✅ **3 Questions Per Generate**: Full explanation + memory tricks for each  

## 📚 Available Books

**Constitution & Polity**
- Indian Polity (NCERT + Laxmikanth)
- Indian Constitution

**Economics**
- Indian Economy
- Microeconomics

**Governance**
- Public Administration
- Government Schemes

**Current Events**
- The Hindu Analysis
- Modern History

## 🔧 Development

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Express + Groq SDK (Llama 3.3 70B)
- **OCR**: Tesseract.js (client-side)
- **Deployment**: Vercel (frontend), Local (backend)

## 📝 API Endpoints

**Generate from manual selection:**
```bash
POST http://localhost:8787/api/generate
Content-Type: application/json

{
  "bookName": "Indian Polity",
  "chapterName": "Fundamental Rights",
  "topic": "Writs",
  "paragraphNumber": 1
}
```

**Generate from OCR text:**
```bash
POST http://localhost:8787/api/generate/from-text
Content-Type: application/json

{
  "paragraphText": "The Constitution provides...",
  "paragraphIndex": 0
}
```

## 🚀 Deployment Options

### Keep Using Locally (Recommended - Fully Working ✅)
Just follow the Quick Start above!

### Deploy API Online
Want to deploy the backend API to a production server?

**Option A: Railway.app**
1. Push your code to GitHub
2. Connect Railway to your GitHub repo
3. Set `GROQ_API_KEY` environment variable
4. Deploy `server.js`
5. Update API URL in `src/App.jsx` from `/api/generate` to your Railway URL

**Option B: Render.com**
Similar process to Railway

**Option C: Heroku (Free tier ending)**
Use Procfile with `web: node server.js`

## ⚙️ Configuration

### Add More Books
Edit [books.json](src/books.json) and add new entries:
```json
{
  "category": "Category Name",
  "books": [
    {
      "name": "Book Name",
      "chapters": ["Chapter 1", "Chapter 2"]
    }
  ]
}
```

### Change AI Model
Edit [server.js](server.js) line with:
```javascript
model: 'llama-3.3-70b-versatile' // Change this
```

Other Groq models:
- `mixtral-8x7b-32768` (fast)
- `gemma-7b-it` (lightweight)

## 🐛 Troubleshooting

**"API undefined" error**
- Make sure backend is running on port 8787
- Check terminal 1: `npm run api`

**"Missing GROQ_API_KEY"**
- Set environment variable before running:
  ```powershell
  $env:GROQ_API_KEY='your-key-here'
  npm run api
  ```

**Port 8787 already in use**
- Kill Node processes and restart

**OCR not detecting text**
- Use clear, high-contrast images (JPG/PNG)
- Try a different image
- Adjust image angle

## 📊 Project Structure

```
quasar-upsc-mcq/
├── public/                  # Static assets
├── src/
│   ├── App.jsx             # Main React component
│   ├── index.css           # Tailwind styling
│   ├── main.jsx            # React entry point
│   └── quasar/
│       └── generateMcqs.js # Question generation logic
├── api/
│   ├── generate.js         # Serverless function (Vercel)
│   └── generate-from-text.js
├── server.js               # Express API server (local)
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies
```

## 📞 Support

Having issues?
1. Check console (F12) for specific error messages
2. Try restarting both server and frontend
3. Make sure .env file has GROQ_API_KEY

## 📄 License

Built for UPSC preparation enthusiasts!

---

**Status**: ✅ Fully Functional Locally | 🟡 Frontend on Vercel | ❌ API needs local/external deployment
