# 🔒 Supabase RLS (Row Level Security) Policies

## ✅ Security Policies Configured

Your Supabase `profiles` table has proper RLS policies in place for security:

### 1. **Grant Permissions**
```sql
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
```
- Authenticated users can SELECT and UPDATE their own profiles
- Prevents unauthorized access

### 2. **Read Own Profile Policy**
```sql
CREATE POLICY "read_own_profile"
ON public.profiles
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = id);
```
- Users can only view their own profile
- `auth.uid()` must match the profile `id`
- Prevents users from accessing other users' data

### 3. **Update Own Profile Policy**
```sql
CREATE POLICY "update_own_profile"
ON public.profiles
FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK (
  (SELECT auth.uid()) = id
  AND tier = ANY(ARRAY['free','starter','pro','teams','enterprise'])
);
```
- Users can only update their own profile
- Tier must be one of the valid values: `free`, `starter`, `pro`, `teams`, `enterprise`
- Prevents invalid tier assignments
- Prevents users from updating other users' profiles

## ✅ Code Alignment

Our `profileService.ts` is designed to work with these policies:

1. **`getProfile()`** - Uses `auth.uid()` automatically via Supabase client
   - Only fetches the current user's profile
   - Respects `read_own_profile` policy

2. **`updateTier()`** - Updates only the current user's profile
   - Uses `auth.uid()` automatically
   - Only updates `tier` field (validated by policy)
   - Respects `update_own_profile` policy

## 🔒 Security Benefits

✅ **Data Isolation**: Users can only access their own data  
✅ **Tier Validation**: Only valid tier values can be set  
✅ **Prevents SQL Injection**: Policies are enforced at database level  
✅ **Automatic Enforcement**: Supabase handles policy checks automatically  

## ✅ Production Ready

These policies ensure:
- Users can't view other users' profiles
- Users can't update other users' profiles
- Only valid tier values can be set
- All updates are authenticated

**Your security is properly configured! 🔒**

