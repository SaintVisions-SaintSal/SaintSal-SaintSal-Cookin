# 🔧 Domain Troubleshooting Guide - saintsal.tech

## 🚨 Current Issue: 404 NOT_FOUND on saintsal.tech

The domain is configured in Vercel, but you're getting a Vercel-level 404 error. This means the domain isn't properly linked to a deployment.

## ✅ Step-by-Step Fix

### 1. Check Deployment Status
1. Go to Vercel Dashboard → Your Project
2. Click **"Deployments"** tab
3. Find the **latest deployment** (should show commit `e23320e`)
4. Check if it says **"Ready"** (green checkmark)
5. If it says "Error" or "Building", that's the problem!

### 2. Assign Domain to Production Deployment
1. Go to **Settings** → **Domains**
2. For `www.saintsal.tech`:
   - Click **"Edit"**
   - Under **"Assign to"**, select **"Production"**
   - Make sure it's assigned to the latest successful deployment
   - Click **"Save"**

### 3. Verify Domain Assignment
- The domain should show:
  - ✅ **Valid Configuration**
  - ✅ **Production** (upward arrow icon)
  - ✅ **No redirect warnings**

### 4. Check DNS Configuration
Your DNS should be:
- **A Record** or **CNAME** pointing to Vercel
- Vercel should show you the exact DNS records needed
- Wait 24-48 hours for DNS propagation (though usually faster)

### 5. Force Redeploy
If domain is configured but still not working:
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **"..."** menu → **"Redeploy"**
4. Select **"Use existing Build Cache"** → **"Redeploy"**

## 🔍 Common Issues & Solutions

### Issue: Domain shows "Valid Configuration" but still 404
**Solution:**
- The domain might be assigned to a failed deployment
- Reassign it to a successful production deployment
- Or redeploy the latest commit

### Issue: Build Failed
**Solution:**
1. Check build logs in Vercel
2. Common causes:
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies
   - Build timeout

### Issue: Domain redirects but shows 404
**Solution:**
- `saintsal.tech` redirects to `www.saintsal.tech` (this is correct)
- Make sure `www.saintsal.tech` is assigned to Production
- The redirect (307) is working, but the target domain needs assignment

### Issue: DNS not propagated
**Solution:**
- Check DNS propagation: https://dnschecker.org
- Enter `www.saintsal.tech`
- Should show Vercel's IP addresses globally
- If not, wait or check DNS settings

## 🎯 Quick Checklist

- [ ] Latest deployment is **"Ready"** (not Error/Building)
- [ ] `www.saintsal.tech` is assigned to **"Production"**
- [ ] Domain shows **"Valid Configuration"**
- [ ] DNS records are correct (check Vercel's DNS instructions)
- [ ] Environment variables are set
- [ ] Build completed successfully

## 🚀 Manual Fix Steps

### Option 1: Reassign Domain
1. Vercel Dashboard → Settings → Domains
2. Click **"Edit"** on `www.saintsal.tech`
3. Under **"Assign to"**, select **"Production"**
4. Save

### Option 2: Redeploy
1. Vercel Dashboard → Deployments
2. Find latest deployment
3. Click **"..."** → **"Redeploy"**
4. Wait for build to complete
5. Domain should auto-update

### Option 3: Trigger New Deployment
```bash
# Make a small change and push
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

## 📞 Still Not Working?

1. **Check Vercel Build Logs:**
   - Go to Deployments → Click deployment → View logs
   - Look for errors

2. **Check Domain Assignment:**
   - Settings → Domains
   - Verify `www.saintsal.tech` shows "Production"

3. **Test Vercel Subdomain:**
   - Try: `saint-sal-saint-sal-cookin.vercel.app`
   - If this works, the issue is domain configuration
   - If this also 404s, the deployment failed

4. **Contact Vercel Support:**
   - If everything looks correct but still not working
   - Vercel support is very responsive

## ✅ Success Indicators

When it's working, you should see:
- ✅ Your custom homepage (not 404)
- ✅ Health endpoint works: `https://www.saintsal.tech/api/health`
- ✅ Custom 404 page (if you visit invalid route)
- ✅ All routes load correctly

---

**The most common issue is the domain not being assigned to the Production deployment. Check that first!**

