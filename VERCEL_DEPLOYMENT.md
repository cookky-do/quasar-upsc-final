# Vercel Deployment Guide for QUASAR

## Step 1: Push to GitHub

### 1a) Initialize Git (if not done)
```bash
cd c:\Users\ATC\Desktop\final
git init
git add .
git commit -m "Initial commit - QUASAR UPSC MCQ Generator"
```

### 1b) Create Repository on GitHub
1. Go to https://github.com/new
2. Create repo name: `quasar-upsc-mcq` (or your choice)
3. DO NOT initialize with README
4. Click "Create repository"

### 1c) Push Code to GitHub
```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/quasar-upsc-mcq.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Frontend on Vercel

### 2a) Connect Vercel to GitHub
1. Go to https://vercel.com
2. Sign up with GitHub (authorize Vercel)
3. Click "Import Project"
4. Select your repo `quasar-upsc-mcq`

### 2b) Configure Vercel Project
**Root Directory:** `vocal-pitch-trainer`

**Environment Variables:** Add
```
VITE_API_URL=https://your-backend-url.com
```
(Keep blank for now, set after backend deployed)

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```bash
dist
```

### 2c) Deploy
Click "Deploy" - Frontend will be live in ~2-5 minutes ✅

---

## Step 3: Deploy Backend on Vercel

### 3a) Create `vercel.json` in root
```json
{
  "version": 2,
  "builds": [
    {
      "src": "vocal-pitch-trainer/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "vocal-pitch-trainer/server.js"
    }
  ]
}
```

### 3b) Update `server.js` for Serverless
Add at top:
```javascript
// Export handler for Vercel
module.exports = app
```

Change bottom from:
```javascript
const port = Number(process.env.PORT || 8787)
app.listen(port, () => {})
```

To:
```javascript
// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = Number(process.env.PORT || 8787)
  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
}
```

### 3c) Add to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import same GitHub repo again (or link existing)
4. **Root Directory:** `vocal-pitch-trainer`

### 3d) Environment Variables
Add in Vercel Settings:
```
GROQ_API_KEY = your_groq_key_here
```

### 3e) Deploy Backend
Click Deploy - you'll get a URL like:
```
https://quasar-upsc-mcq.vercel.app/api/generate
```

---

## Step 4: Link Frontend to Backend

### 4a) Update Frontend `.env`
Create `vocal-pitch-trainer/.env.production`:
```
VITE_API_URL=https://YOUR_BACKEND_VERCEL_URL
```

Update fetch calls in `generateMcqs.js` and `ocrExtractor.js`:
```javascript
const baseURL = import.meta.env.VITE_API_URL || ''
const res = await fetch(`${baseURL}/api/generate`, {...})
```

### 4b) Redeploy Frontend
Push changes to GitHub - Vercel auto-redeploys ✅

---

## Common Errors & Fixes

### ❌ Error: "Cannot find module 'dotenv'"
**Fix:** Add to `server.js` start:
```javascript
import dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '.env') })
```

### ❌ Error: "GROQ_API_KEY is undefined"
**Fix:** 
1. Add to Vercel Environment Variables
2. Redeploy

### ❌ Error: "Build failed - Port already in use"
**Fix:** Use environment detection:
```javascript
if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`Server on ${port}`))
}
```

### ❌ Error: "CORS errors"
**Fix:** Add to `server.js`:
```javascript
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'http://localhost:5173'
  ]
}))
```

### ❌ Error: "OCR not working on Vercel"
**Fix:** Tesseract.js uses wasm files - they might not be bundled. Use client-side only (already done ✅)

### ❌ Error: "Build times out"
**Fix:** Increase timeout in `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "functions": {
    "api/**.js": {
      "maxDuration": 30
    }
  }
}
```

---

## Testing Deployment

### Test Frontend
```
https://your-frontend.vercel.app
```

### Test API
```bash
curl -X POST https://your-backend.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "bookName": "Indian Polity — Laxmikanth",
    "chapterName": "Fundamental Rights",
    "topic": "Writs",
    "paragraphNumber": 1
  }'
```

---

## Final Checklist ✓

- [ ] GitHub repo created and code pushed
- [ ] Frontend deployed on Vercel
- [ ] Backend deployed on Vercel
- [ ] GROQ_API_KEY added to backend env vars
- [ ] Frontend .env.production updated with backend URL
- [ ] Generate questions working end-to-end
- [ ] OCR upload and processing working
- [ ] No console errors in browser DevTools

---

## What Error Are You Getting?

If you're seeing an error, paste it here and I'll fix it! Common ones:
- Build failed
- CORS error
- Cannot find module
- GROQ_API_KEY undefined
- Dynamic require/import issues
