# 🚨 ADD MISSING ENVIRONMENT VARIABLES IN VERCEL

## ❌ What's Missing

You're missing the **most critical** environment variable:

### Missing:
- ❌ `NEXT_PUBLIC_SUPABASE_URL` - **THIS IS REQUIRED!**

### You Have (but wrong names):
- ✅ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - This works, but we prefer `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_PUBLISHABLE_API_KEY` - Wrong name (needs `NEXT_PUBLIC_` prefix for browser)

## ✅ Quick Fix - Add These in Vercel

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

### Add This One (REQUIRED):

**Name:** `NEXT_PUBLIC_SUPABASE_URL`  
**Value:** `https://euxrlpuegeiggedqbkiv.supabase.co`  
**Environment:** Select **Production** AND **Preview**

### Optional (Better naming):

**Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
**Value:** (Copy the value from `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`)  
**Environment:** Select **Production** AND **Preview**

**OR** just keep using `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - I've updated the code to support it!

## ✅ After Adding

1. **Click "Save"**
2. Go to **"Deployments"** tab
3. Click **"Redeploy"** on the latest deployment
4. Wait for deployment to complete
5. Clear browser cache
6. Try signing in again!

## 🎯 Why This Fixes It

The code is looking for `NEXT_PUBLIC_SUPABASE_URL` but it doesn't exist in Vercel. Without the URL, Supabase can't connect, causing the "Invalid API key" error.

**The code now supports your existing variable names, but you MUST add `NEXT_PUBLIC_SUPABASE_URL`!**

