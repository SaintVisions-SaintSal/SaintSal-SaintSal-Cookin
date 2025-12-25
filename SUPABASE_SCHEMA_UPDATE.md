# 📊 Supabase Schema Update - Complete Profile Table

## ✅ Updated Schema

Your `profiles` table now includes all necessary fields:

### Full Schema
```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  full_name text,
  tier text DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'pro', 'teams', 'enterprise')),
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  
  -- GHL Integration
  ghl_contact_id text,
  ghl_location_id text,
  
  -- Stripe Integration
  stripe_customer_id text,
  stripe_subscription_id text,
  
  -- Usage Tracking
  monthly_requests INTEGER NOT NULL DEFAULT 0 CHECK (monthly_requests >= 0),
  request_limit INTEGER NOT NULL DEFAULT 50 CHECK (request_limit >= 0),
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### Indexes (Performance Optimization)
```sql
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON public.profiles(tier);
```

## ✅ Code Updates

### 1. Profile Interface Updated
- ✅ Added `ghl_contact_id`
- ✅ Added `ghl_location_id`
- ✅ Added `stripe_subscription_id`
- ✅ Added `monthly_requests` (with default 0)
- ✅ Added `request_limit` (with default 50)

### 2. ProfileService Enhanced
- ✅ `updateTier()` now accepts options for GHL and Stripe IDs
- ✅ Automatically updates `request_limit` based on tier
- ✅ Added `canMakeRequest()` - checks if user can make requests
- ✅ Added `incrementRequestCount()` - tracks usage
- ✅ Added `resetMonthlyRequests()` - for billing cycle resets

### 3. Request Limit Management
- **Free**: 50 requests/month
- **Starter**: 500 requests/month
- **Pro**: 2,000 requests/month
- **Teams**: 10,000 requests/month
- **Enterprise**: 999,999 requests/month (unlimited)

## 🔒 Security & Constraints

### CHECK Constraints
- `monthly_requests >= 0` - Prevents negative values
- `request_limit >= 0` - Prevents negative values
- `tier IN (...)` - Only valid tier values
- `role IN (...)` - Only valid role values

### Indexes
- `idx_profiles_email` - Fast email lookups
- `idx_profiles_tier` - Fast tier-based queries

## 📊 Usage Tracking Flow

1. **User makes request** → `incrementRequestCount()` called
2. **Check if allowed** → `canMakeRequest()` checks limits
3. **Monthly reset** → `resetMonthlyRequests()` at billing cycle
4. **Tier upgrade** → `updateTier()` updates `request_limit`

## ✅ Production Ready

- ✅ Schema matches code
- ✅ All fields supported
- ✅ Request tracking implemented
- ✅ Performance indexes created
- ✅ Constraints ensure data integrity

**Everything is aligned and ready! 🚀**

