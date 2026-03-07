# 🚀 Quick Start: Full Stack Deployment

## Current Status
✅ **Frontend**: Deployed on Vercel  
⏳ **Backend**: Ready to deploy on Railway  
✅ **AI Engine**: Groq (ready to use)

---

## 3 Steps to Production

### Step 1️⃣: Deploy Backend to Railway (5 minutes)

**What you need:**
- GitHub account (we already have it)
- Railway account (free, sign up at https://railway.app)

**Instructions:**
1. Go to **https://railway.app**
2. Click "Create New Project"
3. Select "Deploy from GitHub repo"
4. Choose `quasar-upsc-mcq` repository
5. Railway auto-detects configuration from `Procfile`
6. Click "Deploy"
7. Wait ~2 minutes for deployment
8. **Copy the Railway URL** (looks like: `https://your-app-name-production.railway.app`)

**Set Environment Variable in Railway:**
- In Railway dashboard → Variables
- Add: `GROQ_API_KEY = [your-groq-api-key]`
- Save

---

### Step 2️⃣: Configure Frontend (2 minutes)

**Go to Vercel Dashboard:**
1. Visit **https://vercel.com/dashboard**
2. Click on `quasar-upsc-mcq` project
3. Settings → Environment Variables
4. Add new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: Paste your Railway URL (from Step 1)
   
   Example: `https://quasar-api-production.railway.app`
5. Click "Save"

**Redeploy:**
1. Click "Deployments"
2. Select the latest deployment
3. Click the 3-dot menu → "Redeploy"
4. Wait for deployment (~30 seconds)

---

### Step 3️⃣: Test (1 minute)

**Open in Browser:**
1. Go to **https://quasar-upsc-mcq.vercel.app**
2. Click "Topic Practice" or "Book Page Practice"
3. Select a book, chapter, topic
4. Click "🚀 Start Practice"
5. **✅ You should see AI-generated questions!**

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    User Browser                      │
│           (Uses Vercel-hosted Frontend)              │
└──────────────────────┬──────────────────────────────┘
                       │
                       ├─→ Click "Start Practice"
                       │
┌──────────────────────▼──────────────────────────────┐
│  Frontend: React + Vite (Vercel)                    │
│  https://quasar-upsc-mcq.vercel.app                 │
│  └─→ Reads VITE_API_URL env variable                │
└──────────────────────┬──────────────────────────────┘
                       │
                       ├─→ HTTP POST to Railway API
                       │
┌──────────────────────▼──────────────────────────────┐
│  Backend: Express.js (Railway)                      │
│  https://your-app-name-production.railway.app       │
│  └─→ Reads GROQ_API_KEY from Railway env            │
└──────────────────────┬──────────────────────────────┘
                       │
                       ├─→ Calls Groq API
                       │
┌──────────────────────▼──────────────────────────────┐
│  AI Engine: Groq (llama-3.3-70b-versatile)          │
│  └─→ Generates UPSC questions                       │
└──────────────────────┬──────────────────────────────┘
                       │
                       ├─→ Returns MCQs ← JSON ←
                       │
┌──────────────────────▼──────────────────────────────┐
│  User sees 3 authentic UPSC MCQs with:              │
│  ✓ Question text                                     │
│  ✓ 4 options (A, B, C, D)                           │
│  ✓ Correct answer                                    │
│  ✓ Explanation                                       │
│  ✓ Memory trick                                      │
└─────────────────────────────────────────────────────┘
```

---

## What Each Component Does

### Frontend (Vercel)
- Shows beautiful QUASAR interface
- Handles book selection, chapter input, topic input
- Handles OCR image upload & text extraction
- Sends API requests to Railway backend
- Displays questions returned from API

### Backend (Railway)  
- Express.js server running `node server.js`
- Validates incoming requests
- Calls Groq API with UPSC question prompts
- Seeds questions with 9 authentic UPSC patterns
- Returns formatted JSON with 3 questions

### Groq API
- Provides `llama-3.3-70b-versatile` LLM
- Generates authentic UPSC-style questions
- Ensures pattern diversity
- Returns properly formatted JSON

---

## Troubleshooting

### "API not available" Error
**Cause:** Railway backend not deployed yet  
**Fix:** Complete Step 1 above

### "Invalid API URL" Error  
**Cause:** VITE_API_URL not set in Vercel  
**Fix:** Complete Step 2 above and ensure you copied Railway URL correctly

### "Cannot read response"  
**Cause:** Railway URL unreachable  
**Fix:** 
- Check Railway dashboard to see if app is running
- Look at Railway logs for errors
- Verify GROQ_API_KEY is set on Railway

### "GROQ key error"
**Cause:** API key not configured  
**Fix:** Add `GROQ_API_KEY` to Railway environment variables

### Questions taking too long to generate
**Cause:** Groq free tier is slow  
**Fix:** Be patient (10-30 seconds is normal) or upgrade Groq plan

---

## Local Development

You can also run locally without Railway:

```powershell
# Terminal 1 - API Server
cd c:\Users\ATC\Desktop\final\quasar-upsc-mcq
$env:GROQ_API_KEY='[your-groq-api-key]'
npm run api

# Terminal 2 - Frontend  
npm run dev
```

Visit `http://localhost:5173` - works perfectly locally!

---

## Cost Summary

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | Free | Frontend hosting |
| Railway | $5/month | Backend hosting (includes $5 free credits) |
| Groq | Free | Up to 10k requests/day on free tier |
| **Total** | **~$0-5/month** | Very affordable |

---

## Files Added for Deployment

- **`Procfile`** - Tells Railway how to start the app
- **`railway.json`** - Railway configuration
- **`RAILWAY_DEPLOYMENT.md`** - Detailed deployment guide
- **`updateGenerateMcqs.js`** - Dynamic API URL support (uses `VITE_API_URL`)
- **`.env.local`** - Local development config

---

## Next Steps

1. ✅ Frontend already deployed on Vercel
2. 📋 Read through instructions above
3. 🚀 Deploy backend to Railway (Step 1)
4. ⚙️ Set environment variables (Step 2)  
5. ✨ Test in browser (Step 3)

**Then you're live!** 🎉

For detailed info, see [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)
