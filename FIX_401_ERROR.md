# 🔧 Fix 401 "Missing authorization header" Error

## Issue

Getting `401: Missing authorization header` when calling the Edge Function.

## Root Causes

1. **Missing Authorization Header** - Edge Function requires JWT token
2. **Wrong Function Name** - You mentioned `ghl-sync-tier` but we created `ghl-update-tier`
3. **Missing API Key** - Need `apikey` header for Supabase functions

## ✅ Solution 1: Use Correct Function Name

The Edge Function is named `ghl-update-tier`, not `ghl-sync-tier`.

**Correct URL:**
```
https://euxrlpuegeiggedqbkiv.supabase.co/functions/v1/ghl-update-tier
```

## ✅ Solution 2: Proper Request Headers

When calling from frontend, include ALL required headers:

```typescript
import { getAuthToken } from '@/lib/supabase';

async function callEdgeFunction(ghlProductId: string) {
  // 1. Get auth token
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  // 2. Get Supabase config
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration');
  }

  // 3. Call Edge Function with ALL headers
  const response = await fetch(
    `${supabaseUrl}/functions/v1/ghl-update-tier`, // ← Correct function name
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // ← Required!
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey, // ← Required!
      },
      body: JSON.stringify({
        ghl_product_id: ghlProductId
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update tier');
  }

  return await response.json();
}
```

## ✅ Solution 3: Use profileService Method

The `profileService` already has a method that handles this correctly:

```typescript
import { profileService } from '@/services/profileService';

// This method handles all headers correctly
const result = await profileService.updateTierViaEdgeFunction(
  '69467bdcccecbd04ba5f18a7', // GHL product ID
  {
    ghlContactId: 'optional',
    ghlLocationId: 'optional'
  }
);

if (result.success) {
  console.log('✅ Tier updated:', result.data);
} else {
  console.error('❌ Error:', result.error);
}
```

## ✅ Solution 4: Test with curl

Test the Edge Function directly:

```bash
# First, get a JWT token (from browser console after login)
TOKEN="your_jwt_token_here"
ANON_KEY="sb_publishable_tGG4-ywayJf16tf0ZI0xSw_wDg1oG5r"

curl -X POST \
  "https://euxrlpuegeiggedqbkiv.supabase.co/functions/v1/ghl-update-tier" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -d '{
    "ghl_product_id": "69467bdcccecbd04ba5f18a7"
  }'
```

## 🔍 Debugging Steps

### 1. Check Function Name
- ✅ Correct: `ghl-update-tier`
- ❌ Wrong: `ghl-sync-tier`

### 2. Verify Headers
Required headers:
- ✅ `Authorization: Bearer <jwt_token>`
- ✅ `Content-Type: application/json`
- ✅ `apikey: <supabase_anon_key>`

### 3. Check Token Validity
```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log('Token exists:', !!session?.access_token);
console.log('Token length:', session?.access_token?.length);
```

### 4. Check Environment Variables
```typescript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
```

## ✅ Quick Fix for Payment Success Page

Update `src/app/payment-success/page.tsx`:

```typescript
// Extract GHL product ID from URL
const ghlProductId = searchParams.get('product_id') || 
                     searchParams.get('ghl_product_id');

if (ghlProductId) {
  // Use the service method (handles headers correctly)
  const result = await profileService.updateTierViaEdgeFunction(
    ghlProductId,
    {
      ghlContactId: searchParams.get('contact_id') || undefined,
      ghlLocationId: searchParams.get('location_id') || undefined
    }
  );

  if (result.success) {
    // Success! Redirect to homepage
    router.push('/');
  } else {
    console.error('Failed to update tier:', result.error);
    setError(result.error);
  }
}
```

## 🎯 Summary

**The 401 error means:**
- Missing `Authorization` header, OR
- Missing `apikey` header, OR
- Invalid/expired JWT token

**Fix:**
1. Use correct function name: `ghl-update-tier`
2. Include all required headers
3. Use `profileService.updateTierViaEdgeFunction()` method
4. Ensure user is authenticated before calling

**Everything should work now! 🚀**

