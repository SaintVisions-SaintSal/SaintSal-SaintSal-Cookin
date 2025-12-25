# 🚨 URGENT: Fix Domain Issue - Step by Step

## ✅ Code Pushed Successfully!
**Commit**: `c3a8311` - Domain configuration fixes  
**Status**: Pushed to GitHub, Vercel should be building now

## 🎯 DO THIS NOW (5 Minutes)

### Step 1: Go to Vercel Dashboard (2 min)
1. Open: https://vercel.com/dashboard
2. Find project: **"SaintVisionAi - Cookin Knowledge"** or **"saint-sal-saint-sal-cookin"**
3. Click on it

### Step 2: Check New Deployment (1 min)
1. Click **"Deployments"** tab
2. Look for the **NEWEST** deployment (should show commit `c3a8311`)
3. Wait for it to finish building (status will say "Building" → "Ready")
4. **If it says "Error"** → Click it and check the logs

### Step 3: Assign Domain to Production (2 min) ⚠️ CRITICAL
1. Click **"Settings"** tab (top navigation)
2. Click **"Domains"** (left sidebar)
3. Find **`www.saintsal.tech`** in the list
4. Click **"Edit"** button next to it
5. Under **"Assign to"** dropdown:
   - Select **"Production"** (NOT Preview, NOT Development)
6. Click **"Save"**
7. Do the same for **`saintsal.tech`** if it's listed separately

### Step 4: Verify (1 min)
1. Wait 1-2 minutes after saving
2. Visit: `https://www.saintsal.tech`
3. Should see your homepage (not 404!)

## 🔍 If Deployment Failed

### Check Build Logs:
1. Deployments → Click the failed deployment
2. Scroll down to see error messages
3. Common issues:
   - **Missing environment variables** → Go to Settings → Environment Variables
   - **Build timeout** → Try redeploying
   - **TypeScript errors** → Check the error message

### Fix Environment Variables:
1. Settings → Environment Variables
2. Add these (if missing):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_BACKEND_URL=https://saintsal-backend-0mv8.onrender.com
   NEXT_PUBLIC_SITE_URL=https://www.saintsal.tech
   ```
3. After adding, go to Deployments → Click "..." → "Redeploy"

## 🚨 If Domain Still Shows 404

### Option 1: Force Redeploy
1. Deployments tab
2. Find the latest deployment (should be `c3a8311`)
3. Click **"..."** (three dots menu)
4. Click **"Redeploy"**
5. Select **"Use existing Build Cache"**
6. Click **"Redeploy"**
7. Wait 3-5 minutes
8. Re-check domain assignment (Step 3 above)

### Option 2: Check DNS
1. Settings → Domains
2. Click on `www.saintsal.tech`
3. Check if it shows DNS instructions
4. Verify your DNS records match what Vercel says
5. DNS propagation can take 24-48 hours (usually faster)

### Option 3: Test Vercel Subdomain
1. Try: `https://saint-sal-saint-sal-cookin.vercel.app`
2. If this works → Domain configuration issue
3. If this also 404s → Deployment/build issue

## ✅ Success Indicators

You'll know it's working when:
- ✅ `www.saintsal.tech` shows your homepage
- ✅ `saintsal.tech` redirects to `www.saintsal.tech` (307)
- ✅ `/api/health` returns JSON: `{"status":"healthy",...}`
- ✅ Custom 404 page shows (not Vercel 404)

## 🆘 Still Not Working?

### Check These:
1. **Deployment Status**: Is it "Ready" or "Error"?
2. **Domain Assignment**: Is `www.saintsal.tech` assigned to "Production"?
3. **Environment Variables**: Are they all set?
4. **Build Logs**: Any errors in the deployment logs?
5. **DNS**: Are DNS records correct?

### Get Help:
- Vercel Support: https://vercel.com/support
- Check build logs for specific error messages
- Verify all environment variables are set

---

## 📋 Quick Checklist

- [ ] New deployment (`c3a8311`) is building/completed
- [ ] `www.saintsal.tech` is assigned to **"Production"**
- [ ] All environment variables are set
- [ ] Build completed successfully (not failed)
- [ ] Waited 1-2 minutes after domain assignment
- [ ] Tested `www.saintsal.tech` in browser

**The #1 issue is usually the domain not being assigned to Production. Check that first!**

