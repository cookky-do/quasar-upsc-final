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
Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.
PS C:\Users\ATC\Desktop\final>
 
 
s:753:9)modules/vercel/dist/chunks/chunk-OYLVZVKK.js:310:28)el/dist/chunks/chunk-OYLVZVKK.js:262:18)modules/vercel/dist/chunks/chunk-OYLVZVKK.js:310:28)el/dist/chunks/chunk-OYLVZVKK.js:262:18)modules/vercel/dist/chunks/chunk-OYLVZVKK.js:310:28)el/dist/chunks/chunk-OYLVZVKK.js:262:18)el/dist/chunks/chunk-OYLVZVKK.js:262:18)el/dist/chunks/chunk-OYLVZVKK.js:262:18)53:29)Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.PS C:\Users\ATC\Desktop\final> 
91 x 4
39
vercel 2>&1 | head -50
vercel 2>&1 | Select-Object -First 30
Found it! ❌ The error is in your vercel.json file:

The nodejs18.x format is outdated. Let me fix it:

Now commit and redeploy:

vercel --prod 2>&1 | Select-Object -First 50
vercel --prod 2>&1 | Select-Object -First 60
Good progress! Now remove the secret reference from vercel.json (we'll set it in Vercel dashboard):

vercel env add GROQ_API_KEY --prod 2>&1
vercel --prod 2>&1 | Select-Object -First 80
The issue is that Vercel can't find vite because it's installing dependencies in the wrong directory. Let me fix the vercel.json to set the correct root:

cd c:\Users\ATC\Desktop\final\vocal-pitch-trainer ; vercel --prod 2>&1 | tail -100
echo "y" | vercel --prod 2>&1 | tail -120
echo "y" | vercel --prod 2>&1 | Select-Object -Last 120
🎉 Frontend deployed successfully!

URL: https://vocal-pitch-trainer.vercel.app

But now we need to set up the backend API. The frontend is deployed, but the API routes need configuration. Let me create the proper API structure:

🎉 Deployment successful!

Live URLs:

Frontend: https://vocal-pitch-trainer.vercel.app
API: https://vocal-pitch-trainer.vercel.app/api/generate
Now let me test the API to make sure it's working:

$body = @{bookName="Indian Polity";chapterName="Fundamental Rights";topic="Writs";paragraphNumber=1} | ConvertTo-Json; (Invoke-WebRequest -Uri "https://vocal-pitch-trainer.vercel.app/api/generate" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 60).Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
The API is responding but missing the GROQ_API_KEY. Let me verify it's set in Vercel:

Now redeploy to apply the environment variable:

$body = @{bookName="Indian Polity";chapterName="Fundamental Rights";topic="Writs";paragraphNumber=1} | ConvertTo-Json; (Invoke-WebRequest -Uri "https://vocal-pitch-trainer.vercel.app/api/generate" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 60).Content | ConvertFrom-Json | ConvertTo-Json -Depth 2 | Select-Object -First 40
Start-Sleep -Seconds 5; $body = @{bookName="Indian Polity";chapterName="Fundamental Rights";topic="Writs";paragraphNumber=1} | ConvertTo-Json; (Invoke-WebRequest -Uri "https://vocal-pitch-trainer.vercel.app/api/generate" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 90).Content | ConvertFrom-Json | ConvertTo-Json -Depth 2
Let me test locally to debug the API issue:

$env:GROQ_API_KEY='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'; Start-Job -ScriptBlock { cd c:\Users\ATC\Desktop\final\vocal-pitch-trainer; npm run dev 2>&1 | Select-Object -First 20 } | Wait-Job; Start-Sleep -Seconds 8; $body = @{bookName="Indian Polity";chapterName="Fundamental Rights";topic="Writs";paragraphNumber=1} | ConvertTo-Json; (Invoke-WebRequest -Uri "http://localhost:5173/api/generate" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 60).Content | ConvertFrom-Json | ConvertTo-Json -Depth 2 | Select-Object 
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
