# ⚡ Deploy to Render (5 minutes)

## Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repos

## Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Select **`quasar-upsc-mcq`** repo
3. Fill in:
   - **Name**: `quasar-upsc-mcq` (or your choice)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free (or paid for production)

## Step 3: Add Environment Variables
In the "Environment" section, click **"Add Environment Variable"**:
- **Key**: `GROQ_API_KEY`
- **Value**: `[your-groq-api-key]`
- **Key**: `NODE_ENV`
- **Value**: `production`

Click **"Create Web Service"** and wait ~2 minutes for deployment

## Step 4: Get Your Render URL
Once deployed (green "Live" status):
- Go to your service dashboard
- Copy the URL (looks like: 

## Step 5: Update Vercel
1. Go to https://vercel.com/dashboard
2. Click `quasar-upsc-mcq` project
3. Settings → Environment Variables
4. Add/Update:
   - **Name**: `VITE_API_URL`
   - **Value**: Your Render URL (e.g.,
5. Click "Save"
6. Go to Deployments → Latest → Click 3-dots → Redeploy

## Done! ✅
Your UPSC MCQ engine is now LIVE:
- Frontend: https://quasar-upsc-mcq.vercel.app
- Backend: https://quasar-upsc-mcq.onrender.com
- Ready to generate questions! 🚀

Test it: Open frontend → Select Book/Topic → Click Start Practice → Get AI questions! 🎉
