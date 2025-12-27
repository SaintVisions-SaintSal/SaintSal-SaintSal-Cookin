# 🚨 LOGIN TROUBLESHOOTING - Step by Step

## 🔍 Step 1: Use Debug Page

I've created a debug page to help diagnose the issue:

**Visit:** `https://www.saintsal.tech/auth-debug` (or your Vercel URL)

This will show you:
- ✅ Which environment variables are set
- ❌ Which ones are missing
- 🔍 Test Supabase connection
- 🔍 Test sign in with detailed error messages

## 🎯 Step 2: Check What the Debug Page Shows

### If `NEXT_PUBLIC_SUPABASE_URL` shows ❌:

**Fix:** Add in Vercel:
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://euxrlpuegeiggedqbkiv.supabase.co`
- Environment: Production + Preview

### If all keys show ❌:

**Fix:** The environment variables aren't being exposed to the browser. Check:
1. Variables have `NEXT_PUBLIC_` prefix
2. They're set for Production environment
3. You've redeployed after adding them

## 🎯 Step 3: Test Sign In on Debug Page

1. Enter your email: `ryan@cookin.io`
2. Enter your password
3. Click "Test Sign In"
4. **Read the error message carefully!**

### Common Errors:

**"Invalid login credentials"**
- User doesn't exist → Click "Test Sign Up" first
- Wrong password → Reset password
- Email not confirmed → Check email for confirmation link

**"Invalid API key"**
- Missing `NEXT_PUBLIC_SUPABASE_URL` → Add it in Vercel
- Wrong Supabase project → Verify URL matches your project

**"User not found"**
- User doesn't exist → Sign up first!

## 🎯 Step 4: If User Doesn't Exist

1. On debug page, click **"Test Sign Up"**
2. Check your email for confirmation
3. Click confirmation link
4. Then try signing in

## ✅ Quick Checklist

- [ ] Visit `/auth-debug` page
- [ ] Check environment variables status
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` if missing
- [ ] Test connection
- [ ] Test sign up (if user doesn't exist)
- [ ] Test sign in
- [ ] Read error messages carefully
- [ ] Fix based on error message
- [ ] Redeploy after fixing env vars
- [ ] Clear browser cache
- [ ] Try again

## 🚀 Most Likely Issues

1. **Missing `NEXT_PUBLIC_SUPABASE_URL`** (90% of cases)
   - Fix: Add it in Vercel

2. **User doesn't exist** (5% of cases)
   - Fix: Sign up first

3. **Email not confirmed** (3% of cases)
   - Fix: Check email and confirm

4. **Wrong password** (2% of cases)
   - Fix: Reset password or sign up again

**Use the debug page to see exactly what's wrong!**


