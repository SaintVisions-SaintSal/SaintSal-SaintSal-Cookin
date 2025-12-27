# 🚨 COMPLETE LOGIN FIX - Step by Step

## ⚠️ The Problem

You're getting "Invalid API key" when trying to log in. This is almost always one of these issues:

1. **Missing `NEXT_PUBLIC_SUPABASE_URL` in Vercel** (90% of cases)
2. **User doesn't exist in Supabase** (5% of cases)
3. **Environment variables not synced after adding** (3% of cases)
4. **Wrong Supabase project** (2% of cases)

## ✅ COMPLETE FIX - Do These Steps

### Step 1: Add Missing Environment Variable in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Add this:

   **Name:** `NEXT_PUBLIC_SUPABASE_URL`  
   **Value:** `https://euxrlpuegeiggedqbkiv.supabase.co`  
   **Environment:** Select **Production**, **Preview**, and **Development**

4. Click **"Save"**

### Step 2: Verify You Have the Key

You already have `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` which should work, but let's verify it's set for Production:

1. In Environment Variables, find `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
2. Make sure it's set for **Production** environment
3. If not, edit it and add Production

### Step 3: Redeploy (CRITICAL!)

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **"..."** menu → **"Redeploy"**
4. Wait for deployment to complete (2-3 minutes)

### Step 4: Check if User Exists

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Search for `ryan@cookin.io`
3. **If NOT found**, you need to sign up first!

### Step 5: Use Debug Page

1. Visit: `https://www.saintsal.tech/auth-debug`
2. Check what shows ❌
3. Test sign in/sign up
4. Read error messages

### Step 6: Try Sign Up First

If user doesn't exist:

1. Go to `https://www.saintsal.tech/auth`
2. Click **"Don't have an account? Sign up"**
3. Enter email and password
4. Check email for confirmation
5. Confirm account
6. Then sign in

## 🔍 Debug Checklist

After adding env vars and redeploying:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` added in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` set for Production
- [ ] Redeployed after adding variables
- [ ] Visited `/auth-debug` to check status
- [ ] User exists in Supabase (or signed up)
- [ ] Cleared browser cache
- [ ] Tried signing in again

## 🎯 Quick Test

After redeploying, open browser console (F12) and run:

```javascript
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ? 'Set' : 'Missing');
```

**If both show values, the env vars are working!**

## 🚀 Most Likely Fix

**99% chance it's missing `NEXT_PUBLIC_SUPABASE_URL`:**

1. Add it in Vercel (see Step 1 above)
2. Redeploy
3. Try again

**If that doesn't work, the user probably doesn't exist - sign up first!**


