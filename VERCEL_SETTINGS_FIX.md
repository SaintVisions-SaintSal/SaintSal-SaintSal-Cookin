# 🔧 Fix Vercel Settings Mismatch

## ⚠️ Issue Detected

You have a warning: **"Configuration Settings in the current Production deployment differ from your current Project Settings."**

This means your production deployment has different settings than what's configured. This can cause the "Invalid API key" error!

## ✅ Step-by-Step Fix

### Step 1: Check Environment Variables

1. In the left sidebar, click **"Environment Variables"**
2. Verify you see:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **If they're missing or have wrong names, add them!**

### Step 2: Check Production Overrides

1. In the "Build and Deployment" section, expand **"> Production Overrides"**
2. See what's different
3. Either:
   - **Update Project Settings** to match Production, OR
   - **Redeploy** to sync Production with Project Settings

### Step 3: Verify Build Settings

Make sure these are set correctly:

**Framework Preset:** Next.js  
**Root Directory:** (leave empty if code is in root)  
**Build Command:** `next build` (or `npm run build`)  
**Output Directory:** `.next` (or leave default)  
**Install Command:** `npm install`

### Step 4: Sync Settings

1. Click **"Save"** at the bottom of Build and Deployment settings
2. Go to **"Deployments"** tab
3. Click **"Redeploy"** on the latest deployment
4. Or push a new commit to trigger redeploy

## 🎯 Most Important: Environment Variables

**Go to "Environment Variables" in the left sidebar and verify:**

```
NEXT_PUBLIC_SUPABASE_URL=https://euxrlpuegeiggedqbkiv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_tGG4-ywayJf16tf0ZI0xSw_wDg1oG5r
```

**These MUST have the `NEXT_PUBLIC_` prefix to work in the browser!**

## ✅ Quick Action Items

1. ✅ Click "Environment Variables" in left sidebar
2. ✅ Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` exist
3. ✅ Expand "Production Overrides" to see what's different
4. ✅ Click "Save" in Build and Deployment
5. ✅ Redeploy to sync everything

**After fixing, the "Invalid API key" error should be resolved!**

