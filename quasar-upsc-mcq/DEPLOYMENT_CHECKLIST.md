# ✨ Deployment Checklist

Use this to track progress as you deploy to production!

---

## 🔵 PHASE 1: Deploy Backend to Railway (8 minutes)

- [ ] **1.1** Open https://railway.app in your browser
- [ ] **1.2** Click "Create Account" and sign up with GitHub
- [ ] **1.3** Authorize Railway to access your GitHub
- [ ] **1.4** Back on Railway dashboard: Click "New Project"
- [ ] **1.5** Select "Deploy from GitHub repo"
- [ ] **1.6** Select `quasar-upsc-mcq` repository
- [ ] **1.7** Click "Deploy" and wait for Railway to build (~2 minutes)
- [ ] **1.8** Once deployed, go to Railway dashboard → Variables
- [ ] **1.9** Add new variable:
  - Name: `GROQ_API_KEY`
  - Value: `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`
- [ ] **1.10** Click "Save"
- [ ] **1.11** Go back to Railway project → Settings
- [ ] **1.12** Copy the **Railway URL** (looks like: `https://your-app-name-production.railway.app`)
- [ ] **1.13** Save it somewhere (you'll need it in Phase 2)

✅ **Phase 1 complete!** Backend is now live on Railway.

---

## 🔵 PHASE 2: Configure Vercel (5 minutes)

- [ ] **2.1** Open https://vercel.com/dashboard in your browser
- [ ] **2.2** Click on the `quasar-upsc-mcq` project
- [ ] **2.3** Go to **Settings** (top menu)
- [ ] **2.4** Click **Environment Variables** (left sidebar)
- [ ] **2.5** Click **"Add New"** button
- [ ] **2.6** Fill in:
  - **Name**: `VITE_API_URL`
  - **Value**: Paste the Railway URL from step 1.12
  - Example: `https://quasar-upsc-mcq-production.railway.app`
- [ ] **2.7** Click **"Save"** button
- [ ] **2.8** Go back to **Deployments** (top menu)
- [ ] **2.9** Find the latest deployment in the list
- [ ] **2.10** Click the **3-dot menu** on the right
- [ ] **2.11** Select **"Redeploy"**
- [ ] **2.12** Wait for deployment to complete (~30 seconds)

✅ **Phase 2 complete!** Frontend now knows where to find the API.

---

## 🔵 PHASE 3: Test End-to-End (6 minutes)

- [ ] **3.1** Open https://quasar-upsc-mcq.vercel.app in your browser
- [ ] **3.2** Wait for page to load
- [ ] **3.3** You should see the QUASAR homepage with two cards:
  - 📘 Book Page Practice (purple)
  - 🧠 Topic Practice (indigo)
- [ ] **3.4** Click on **"📘 Book Page Practice"** or **"🧠 Topic Practice"**
- [ ] **3.5** Select any book (e.g., "POLITY")
- [ ] **3.6** Enter chapter number (e.g., "1")
- [ ] **3.7** Enter topic (e.g., "Constitution of India")
- [ ] **3.8** Click **"🚀 Start Practice"**
- [ ] **3.9** **⏳ WAIT** for 10-30 seconds (API is generating questions)
- [ ] **3.10** You should see **3 UPSC-style multiple choice questions** with:
  - ✓ Question text
  - ✓ 4 options (A, B, C, D)
  - ✓ Correct answer highlighted
  - ✓ Explanation
  - ✓ Memory trick
- [ ] **3.11** Try clicking "Next Question" to see more
- [ ] **3.12** Click **"← Back to Homepage"** at the bottom
- [ ] **3.13** Click the other practice mode to test it
- [ ] **3.14** 🎉 **SUCCESS!** Everything is working!

✅ **Phase 3 complete!** Your system is in production!

---

## ✅ Verification Checklist

After all phases, verify:

- [ ] Frontend loads at quasar-upsc-mcq.vercel.app
- [ ] Can select "Book Page Practice" or "Topic Practice"
- [ ] Can input book/chapter/topic
- [ ] Questions appear after 10-30 seconds
- [ ] Questions have proper format (Q, Options, Answer, Explanation)
- [ ] Can navigate between questions
- [ ] Can go back to homepage
- [ ] No errors in browser console (F12 → Console tab)
- [ ] Railway backend is running (check Railway dashboard)
- [ ] Vercel shows latest deployment

---

## 🆘 If Something Goes Wrong

### ❌ "Cannot reach API" or "API error"
**Cause**: Railway backend not deployed or not running  
**Fix**:
1. Check Railway dashboard (https://railway.app/dashboard)
2. Make sure project shows green "Active" status
3. Check Logs tab for any errors
4. Make sure GROQ_API_KEY is set in Variables

### ❌ "API not found"
**Cause**: VITE_API_URL not set in Vercel  
**Fix**:
1. Go to Vercel dashboard → quasar-upsc-mcq
2. Check Settings → Environment Variables
3. Make sure VITE_API_URL is there
4. Make sure value matches your Railway URL
5. Redeploy from Deployments menu

### ❌ "Questions never appear"
**Cause**: Groq API key invalid or API slow  
**Fix**:
1. Check GROQ_API_KEY is correct on Railway
2. Wait 30-60 seconds (free tier can be slow)
3. Check browser console for actual error message
4. Try different topic/book to isolate issue

### ❌ "Nothing happens when I click Start"
**Cause**: Frontend not updated or JavaScript error  
**Fix**:
1. Hard refresh browser: Ctrl+Shift+R
2. Check browser console (F12 → Console)
3. Make sure Vercel redeploy completed successfully
4. Try in a different browser

---

## 📊 Success Signs

You'll know it's working when you see:

✅ Vercel frontend loads instantly  
✅ Railway backend accepts API calls  
✅ Groq API generates questions  
✅ Questions appear with:
- Authentic UPSC-style language
- Detailed explanations
- Memory tricks
- Multiple patterns (analysis, definition, application, etc.)

---

## 🎯 Final Checklist

When fully operational:

- [ ] Can visit production URL
- [ ] Can practice with books
- [ ] Can practice with topics
- [ ] Questions generate correctly
- [ ] No console errors
- [ ] Backend responding (check Railway logs)
- [ ] Environment variables set
- [ ] All in git and tracked

---

## 💡 Quick Tips

**To see if backend is running:**
- Go to Railway dashboard
- Click on your quasar-upsc-mcq project
- Check the "Active" status (should be green)

**To see backend errors:**
- Go to Railway dashboard
- Click on your project
- Go to Logs tab
- You'll see real-time log output from server.js

**To see frontend errors:**
- Open your browser's Developer Tools (F12)
- Click "Console" tab
- Look for red error messages
- These help diagnose issues

**To test API directly:**
- Go to https://your-railway-url/api/generate
- You'll see an error saying method not allowed
- But it means backend is reachable! ✅

---

## 📞 Support Resources

If you get stuck:

1. **Read**: [DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md) - 3-step overview
2. **Read**: [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) - Detailed guide with troubleshooting
3. **Check**: This file for step-by-step checklist
4. **Reference**: [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md) - Current system status

---

## 🚀 You've Got This!

Following this checklist should take **~20 minutes total** and will have you running a production UPSC MCQ generator!

Current status:
- ✅ Frontend: Live on Vercel
- ✅ Code: All ready on GitHub
- ⏳ Backend: Waiting for you to deploy to Railway
- ✅ AI: Ready to generate questions

Just follow the phases above and you'll be generating UPSC questions in production! 🎉
