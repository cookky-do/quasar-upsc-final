# 🚀 QUASAR Full Stack Deployment Guide

## Architecture

```
User Browser
    ↓
Frontend (https://quasar-upsc-mcq.vercel.app)
    ↓
API Request
    ↓
Backend (Railway)
    ↓
Groq API
    ↓
Response → MCQs
```

---

## Step 1: Deploy Backend to Railway

### 1. Create Railway Account
Visit **https://railway.app** and sign up with GitHub

### 2. Create New Railway Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Connect your GitHub account
- Select the `quasar-upsc-mcq` repository

### 3. Configure Railway
The app detects the configuration from:
- `Procfile` - Tells Railway how to start: `node server.js`
- `package.json` - Auto-installs dependencies

### 4. Set Environment Variables
In Railway dashboard:
```
GROQ_API_KEY = [your-groq-api-key]
NODE_ENV = production
```

### 5. Deploy
Railway automatically deploys on every push to main branch.

**After deployment:** You'll get a Railway URL like:
```
https://your-app-name-production.railway.app
```

Copy this URL for step 2.

---

## Step 2: Update Vercel Environment Variables

### 1. Go to Vercel Dashboard
Visit **https://vercel.com/dashboard**

### 2. Select `quasar-upsc-mcq` Project
Click on the project name

### 3. Settings → Environment Variables
Add:
```
VITE_API_URL = https://your-railway-app.railway.app
```

### 4. Redeploy
Click "Deployments" → Latest → Click the 3-dots → "Redeploy"

Wait for deployment to complete (≈30 seconds)

---

## Step 3: Test the Full Stack

### Test in Browser
1. Open **https://quasar-upsc-mcq.vercel.app**
2. Select "Topic Practice" or "Book Page Practice"
3. Try to generate questions
4. **Should work end-to-end!** ✅

### Verify Request Flow
Open browser DevTools (F12) → Network tab:
- You'll see API request going to your Railway URL
- Response comes back with MCQs

---

## Troubleshooting

### "API not available" Error
- ❌ Railway backend not deployed yet
- ❌ Environment variable `VITE_API_URL` not set
- ✅ Solution: Deploy to Railway, then add env var to Vercel

### "Invalid GROQ_API_KEY" Error
- ❌ Environment variable not set in Railway
- ✅ Solution: Add `GROQ_API_KEY` to Railway dashboard

### "Connection timeout" Error
- ❌ Railway app is sleeping (free tier goes to sleep after 7 days of inactivity)
- ✅ Solution: Make a request to wake it up, or upgrade plan

### Questions still not generating
- Open DevTools (F12) → Console
- Check error message
- Verify Railway backend is running (check Railway dashboard)

---

## Local Development

### Run Everything Locally
```powershell
# Terminal 1 - API Server
cd c:\Users\ATC\Desktop\final\quasar-upsc-mcq
   $env:GROQ_API_KEY='[your-groq-api-key]'
npm run api
# Runs on http://localhost:8787

# Terminal 2 - Frontend
npm run dev
# Runs on http://localhost:5173
```

Visit `http://localhost:5173` and everything works automatically (API_URL defaults to localhost).

---

## Architecture Details

### Frontend (Vercel)
- Framework: React 19 + Vite
- Hosting: Vercel (free tier)
- Static files served globally with CDN
- Env variable: `VITE_API_URL`

### Backend (Railway)
- Framework: Express.js
- Hosting: Railway (paid, starting $5/month)
- Automatically scales
- Env variable: `GROQ_API_KEY`

### AI Engine (Groq)
- LLM: Llama 3.3 70B
- Model: `llama-3.3-70b-versatile`
- Paid: Free tier with API key (limited requests)

---

## Cost Breakdown

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel | Yes | Free for frontend |
| Railway | $5/month | Includes $5 in free credits |
| Groq | Limited free | Pay-as-you-go |
| **Total** | - | ~$5-10/month |

---

## Next Steps

1. **Create Railway account** - https://railway.app
2. **Deploy this repo** to Railway (connect GitHub)
3. **Get Railway URL** from deployment
4. **Update Vercel env var** with Railway URL
5. **Test in browser** - Should work!

Done! You now have a fully deployed UPSC MCQ generator running on professional infrastructure. 🎉

---

## Support

**Railway Issues?**
- Check Railway dashboard → Logs tab
- Look for deployment errors

**Vercel Issues?**
- Check Vercel dashboard → Deployments → Latest build logs
- Look for env variable errors

**API not working?**
- Check that both services are deployed
- Verify GROQ_API_KEY is set on Railway
- Verify VITE_API_URL is set on Vercel
- Check browser console for exact error message
