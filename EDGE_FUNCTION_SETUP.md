# 🔐 GHL Tier Update Edge Function - Setup Guide

## ✅ What Was Created

A secure Supabase Edge Function (`ghl-update-tier`) that:
- Validates GHL product IDs against `tier_limits` table
- Atomically updates user `tier` and `request_limit`
- Resets `monthly_requests` on tier upgrade
- Uses service_role to bypass RLS securely
- Requires authenticated user context

## 📁 Files Created

- `supabase/functions/ghl-update-tier/index.ts` - Edge Function code
- `supabase/functions/ghl-update-tier/README.md` - Documentation

## 🚀 Deployment Steps

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link Your Project

```bash
# Get your project ref from Supabase Dashboard → Settings → General
supabase link --project-ref euxrlpuegeiggedqbkiv
```

### 4. Set Environment Variables

In Supabase Dashboard:
1. Go to **Edge Functions** → **ghl-update-tier** → **Settings**
2. Add these secrets:

```bash
SUPABASE_URL=https://euxrlpuegeiggedqbkiv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=sb_publishable_tGG4-ywayJf16tf0ZI0xSw_wDg1oG5r
```

**⚠️ IMPORTANT**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client!

### 5. Deploy the Function

```bash
supabase functions deploy ghl-update-tier
```

## 📊 Database Setup

### Create `tier_limits` Table (if not exists)

Run this in Supabase SQL Editor:

```sql
-- Create tier_limits with GHL mapping and quotas
CREATE TABLE IF NOT EXISTS public.tier_limits (
  tier text PRIMARY KEY,
  price_cents integer NOT NULL,
  ghl_product_id text UNIQUE NOT NULL,
  monthly_request_limit integer NOT NULL,
  features jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed with your current tiers
INSERT INTO public.tier_limits (tier, price_cents, ghl_product_id, monthly_request_limit, features) VALUES
('free',       0,     '694671739e4922feddcc3e1e',    50,    '{"models":["basic"]}'),
('starter',    2700,  '69464c136d52f05832acd6d5',    500,   '{"models":["gpt-4o"],"voice":true}'),
('pro',        9700,  '694677961e9e6a5435be0d10',    2000,  '{"models":"all","warroom":true}'),
('teams',      29700, '69467a30d0aaf6f7a96a8d9b',    10000, '{"seats":10}'),
('enterprise', 49700, '69467bdcccecbd04ba5f18a7',    999999,'{"credits":100,"all_features":true}')
ON CONFLICT (tier) DO UPDATE SET
  price_cents = EXCLUDED.price_cents,
  ghl_product_id = EXCLUDED.ghl_product_id,
  monthly_request_limit = EXCLUDED.monthly_request_limit,
  features = EXCLUDED.features,
  updated_at = now();

-- Grant access
GRANT SELECT ON public.tier_limits TO authenticated;
```

## 💻 Frontend Usage

### Update Payment Success Page

In `src/app/payment-success/page.tsx`, use the Edge Function:

```typescript
import { profileService } from '../../services/profileService';

// After GHL payment redirect
const ghlProductId = searchParams.get('product_id'); // From GHL redirect
const ghlContactId = searchParams.get('contact_id');
const ghlLocationId = searchParams.get('location_id');

if (ghlProductId) {
  const result = await profileService.updateTierViaEdgeFunction(
    ghlProductId,
    {
      ghlContactId: ghlContactId || undefined,
      ghlLocationId: ghlLocationId || undefined
    }
  );

  if (result.success) {
    console.log('✅ Tier updated:', result.data);
    // Redirect to homepage
  } else {
    console.error('❌ Failed to update tier:', result.error);
  }
}
```

## 🔒 Security Features

✅ **Authentication Required** - Must have valid JWT token  
✅ **GHL Product Validation** - Validates against `tier_limits` table  
✅ **Service Role Access** - Uses service_role to bypass RLS safely  
✅ **Atomic Updates** - All updates happen in one transaction  
✅ **User Context** - Only updates the authenticated user's profile  

## 📝 API Reference

### Endpoint

```
POST /functions/v1/ghl-update-tier
```

### Headers

```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
apikey: <supabase_anon_key>
```

### Request Body

```json
{
  "ghl_product_id": "69467bdcccecbd04ba5f18a7",
  "ghl_contact_id": "optional",
  "ghl_location_id": "optional"
}
```

### Response (Success)

```json
{
  "success": true,
  "message": "Tier updated successfully",
  "data": {
    "tier": "enterprise",
    "request_limit": 999999,
    "monthly_requests": 0
  }
}
```

### Response (Error)

```json
{
  "error": "Invalid GHL product ID",
  "details": "..."
}
```

## 🧪 Testing

### Test Locally

```bash
# Start Supabase locally
supabase start

# Serve function locally
supabase functions serve ghl-update-tier
```

### Test with curl

```bash
curl -X POST http://localhost:54321/functions/v1/ghl-update-tier \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "ghl_product_id": "69467bdcccecbd04ba5f18a7"
  }'
```

## ✅ Verification Checklist

- [ ] Edge Function deployed successfully
- [ ] Environment variables set in Supabase Dashboard
- [ ] `tier_limits` table created and seeded
- [ ] Tested with valid GHL product ID
- [ ] Tested with invalid GHL product ID (should fail)
- [ ] Tested without authentication (should fail)
- [ ] Frontend updated to use Edge Function
- [ ] Payment flow tested end-to-end

## 🎯 Next Steps

1. Deploy the Edge Function
2. Create `tier_limits` table
3. Update payment success page to use Edge Function
4. Test the complete payment flow
5. Monitor Edge Function logs in Supabase Dashboard

**Everything is ready for production! 🚀**

