# GHL Tier Update Edge Function

Secure Supabase Edge Function for updating user tiers after GHL payment verification.

## Purpose

This Edge Function:
- Validates GHL product IDs against `tier_limits` table
- Atomically updates user `tier` and `request_limit`
- Resets `monthly_requests` on tier upgrade
- Uses service_role to bypass RLS for secure updates
- Requires authenticated user context

## Deployment

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy ghl-update-tier
```

## Environment Variables

Set these in Supabase Dashboard → Edge Functions → ghl-update-tier → Settings:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (never expose to client)
- `SUPABASE_ANON_KEY` - Anon key for user authentication

## Usage

### From Frontend

```typescript
import { getAuthToken } from '@/lib/supabase';

async function updateTierAfterPayment(ghlProductId: string, ghlContactId?: string, ghlLocationId?: string) {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/ghl-update-tier`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        ghl_product_id: ghlProductId,
        ghl_contact_id: ghlContactId,
        ghl_location_id: ghlLocationId
      })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update tier');
  }

  return await response.json();
}
```

## Request Body

```json
{
  "ghl_product_id": "69467bdcccecbd04ba5f18a7",
  "ghl_contact_id": "optional_contact_id",
  "ghl_location_id": "optional_location_id"
}
```

## Response

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

## Security

- ✅ Requires authenticated user (JWT token)
- ✅ Validates GHL product ID against database
- ✅ Uses service_role for secure updates
- ✅ Bypasses RLS safely
- ✅ Atomic updates (all or nothing)

## Error Handling

- `401` - Unauthorized (missing/invalid token)
- `400` - Bad request (missing ghl_product_id or invalid product ID)
- `500` - Internal server error

