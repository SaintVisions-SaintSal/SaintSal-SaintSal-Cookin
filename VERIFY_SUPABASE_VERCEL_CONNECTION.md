# ✅ Verify Supabase-Vercel Connection

## 🎯 Since You Connected Directly

When you connect Supabase directly to Vercel, it should automatically sync environment variables. Let's verify everything is working!

## ✅ Step 1: Verify Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. You should see these automatically synced:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **If they're there, great!** If not, you may need to:
   - Reconnect the integration
   - Or manually add them

## ✅ Step 2: Check Variable Names Match

Vercel might sync them with different names. Check if you see:
- `SUPABASE_URL` (without NEXT_PUBLIC_)
- `SUPABASE_ANON_KEY` (without NEXT_PUBLIC_)

**If so, you need to add `NEXT_PUBLIC_` prefix** because Next.js only exposes variables starting with `NEXT_PUBLIC_` to the browser!

## ✅ Step 3: Verify User Exists

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Check if `ryan@cookin.io` exists
3. **If NOT, you need to sign up first!**

## ✅ Step 4: Test the Connection

After verifying env vars, try:

1. **Clear browser cache** (F12 → Application → Clear storage)
2. **Refresh the page**
3. **Try signing in again**

## 🔍 Quick Debug Test

Open browser console (F12) and check:

```javascript
// Check if env vars are available
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

**If these show `undefined`, the variables aren't being exposed to the browser!**

## 🎯 Most Common Issue After Direct Connection

**Variable names might be wrong!**

Vercel might sync:
- `SUPABASE_URL` ❌ (won't work in browser)
- `SUPABASE_ANON_KEY` ❌ (won't work in browser)

But we need:
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅

**Fix:** Either:
1. Rename them in Vercel to add `NEXT_PUBLIC_` prefix, OR
2. Add new variables with the correct names

## ✅ Quick Fix Checklist

- [ ] Check Vercel env vars are synced
- [ ] Verify they have `NEXT_PUBLIC_` prefix
- [ ] Check user exists in Supabase
- [ ] Redeploy after any changes
- [ ] Clear browser cache
- [ ] Try signing in again

**If user doesn't exist, click "Sign up" first!**

