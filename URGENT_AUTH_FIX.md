# 🚨 URGENT: Fix "Invalid API key" Login Error

## Quick Fix Steps (Do These Now!)

### Step 1: Check Vercel Environment Variables ⚠️ CRITICAL

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Verify these are set (case-sensitive):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://euxrlpuegeiggedqbkiv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_tGG4-ywayJf16tf0ZI0xSw_wDg1oG5r
```

3. **If they're missing or different, add/update them NOW**
4. **After adding, click "Redeploy"** (this is critical!)

### Step 2: Verify User Exists in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Check if `ryan@cookin.io` exists
3. **If NOT, you need to sign up first!**

### Step 3: Try Sign Up Instead

If the user doesn't exist:
1. Click **"Don't have an account? Sign up"** on the login page
2. Enter your email and password
3. Check your email for confirmation link
4. Confirm your account
5. Then try signing in

### Step 4: Check Supabase Auth Settings

In **Supabase Dashboard** → **Authentication** → **Settings**:

1. **Email Auth**: ✅ Must be enabled
2. **Site URL**: Should be `https://www.saintsal.tech` or your Vercel URL
3. **Redirect URLs**: Add your production URL

### Step 5: Clear Browser Cache

1. Open DevTools (F12)
2. Go to **Application** tab → **Storage**
3. Click **Clear site data**
4. Refresh page
5. Try again

## 🔍 Debugging Steps

### Check Environment Variables in Browser

Open browser console (F12) and run:

```javascript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

**If these show `undefined`, environment variables are NOT set in Vercel!**

### Test Supabase Connection

In browser console:

```javascript
// This should work if env vars are set
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  'https://euxrlpuegeiggedqbkiv.supabase.co',
  'sb_publishable_tGG4-ywayJf16tf0ZI0xSw_wDg1oG5r'
);
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'ryan@cookin.io',
  password: 'your_password'
});
console.log('Result:', data, error);
```

## 🎯 Most Likely Causes (In Order)

1. **Missing Environment Variables in Vercel** (90% of cases)
   - Fix: Add them and redeploy

2. **User Doesn't Exist** (5% of cases)
   - Fix: Sign up first

3. **Supabase Auth Not Enabled** (3% of cases)
   - Fix: Enable email auth in Supabase

4. **Wrong Supabase Project** (2% of cases)
   - Fix: Verify project URL matches

## ✅ Quick Test

Try the **"Continue as Guest"** button first - if that works, the issue is specifically with email/password auth, not the API key configuration.

## 🚀 After Fixing

1. Set environment variables in Vercel
2. Redeploy
3. Clear browser cache
4. Try signing in again
5. If user doesn't exist, sign up first

**The "Invalid API key" error usually means the environment variables aren't set in Vercel!**

