# 🔧 Fix "Invalid API key" Authentication Error

## Issue

Getting "Invalid API key" error when trying to sign in with email/password.

## Root Causes

1. **Missing Environment Variables** - Supabase keys not set in Vercel
2. **Incorrect Supabase Configuration** - URL or key mismatch
3. **Supabase Project Settings** - Auth settings not configured correctly

## ✅ Solution 1: Verify Environment Variables in Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Ensure these are set:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://euxrlpuegeiggedqbkiv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_tGG4-ywayJf16tf0ZI0xSw_wDg1oG5r
```

**After adding/updating, redeploy!**

## ✅ Solution 2: Verify Supabase Auth Settings

In **Supabase Dashboard → Authentication → Settings**:

1. **Enable Email Auth**: ✅ Enabled
2. **Enable Anonymous Sign-ins**: ✅ Enabled (if using guest mode)
3. **Site URL**: Should be `https://www.saintsal.tech` or your Vercel URL
4. **Redirect URLs**: Add your production URL

## ✅ Solution 3: Check Supabase Project Status

1. Go to **Supabase Dashboard → Settings → General**
2. Verify project is **Active** (not paused)**
3. Check **API URL** matches: `https://euxrlpuegeiggedqbkiv.supabase.co`
4. Verify **anon/public key** matches your environment variable

## ✅ Solution 4: Test Supabase Connection

Run this in browser console on your site:

```javascript
// Check if Supabase is configured
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Test connection
import { supabase } from '@/lib/supabase';
const { data, error } = await supabase.auth.getSession();
console.log('Connection test:', error ? '❌ ' + error.message : '✅ Connected');
```

## ✅ Solution 5: Clear Browser Data

Sometimes cached auth data causes issues:

1. Open browser DevTools (F12)
2. Go to **Application** tab → **Storage**
3. Clear **Local Storage** and **Session Storage**
4. Refresh page and try again

## 🔍 Debugging Steps

### 1. Check Network Tab

1. Open DevTools → **Network** tab
2. Try to sign in
3. Look for requests to `supabase.co`
4. Check if they return `401` or `400` errors
5. Inspect the error response

### 2. Check Console Logs

Look for:
- `❌ Supabase configuration missing!`
- `❌ Session error:`
- Any Supabase-related errors

### 3. Verify User Exists

In Supabase Dashboard:
1. Go to **Authentication → Users**
2. Check if `ryan@cookin.io` exists
3. If not, create it or use sign up

## ✅ Quick Fix Checklist

- [ ] Environment variables set in Vercel
- [ ] Redeployed after setting env vars
- [ ] Supabase project is active
- [ ] Email auth enabled in Supabase
- [ ] Site URL configured in Supabase
- [ ] Cleared browser cache/storage
- [ ] User exists in Supabase (or sign up first)

## 🎯 Most Common Fix

**99% of the time, it's missing environment variables in Vercel!**

1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Add both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Redeploy** (important!)

## 📝 Updated Code

I've updated the auth page to:
- ✅ Show user-friendly error messages
- ✅ Better error handling
- ✅ Improved Supabase client configuration
- ✅ Better logging for debugging

**Try signing in again after verifying environment variables! 🚀**

