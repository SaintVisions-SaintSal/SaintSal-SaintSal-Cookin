import { createClient } from '@supabase/supabase-js';

// Updated Supabase connection - New instance
// Support multiple naming conventions for Vercel-Supabase integration
const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.SUPABASE_URL || 
  'https://euxrlpuegeiggedqbkiv.supabase.co';

const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  process.env.SUPABASE_PUBLISHABLE_API_KEY ||
  'sb_publishable_tGG4-ywayJf16tf0ZI0xSw_wDg1oG5r';

// Validate configuration - Log detailed info for debugging
if (typeof window !== 'undefined') {
  // Only log in browser (client-side)
  console.log('🔍 Supabase Configuration Check:');
  console.log('URL:', supabaseUrl || '❌ MISSING');
  console.log('Key:', supabaseAnonKey ? '✅ Set (length: ' + supabaseAnonKey.length + ')' : '❌ MISSING');
  console.log('Available env vars:', {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
  });
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ CRITICAL: Supabase configuration missing!');
    console.error('❌ URL:', supabaseUrl ? '✅' : '❌ MISSING - Add NEXT_PUBLIC_SUPABASE_URL in Vercel!');
    console.error('❌ Key:', supabaseAnonKey ? '✅' : '❌ MISSING - Add NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel!');
    console.error('📋 Fix: Go to Vercel → Settings → Environment Variables → Add missing variables → Redeploy');
  } else {
    console.log('✅ Supabase configuration looks good!');
  }
}

// Create Supabase client with better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Helper function to get auth token with refresh
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Session error:', error);
      return null;
    }
    
    if (!session) {
      console.log('❌ No active session found');
      return null;
    }
    
    // Check if token is expired or about to expire (within 5 minutes)
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt ? expiresAt - now : 0;
    
    if (timeUntilExpiry < 300) { // Less than 5 minutes
      console.log('🔄 Token expires soon, refreshing...');
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        return null;
      }
      
      if (refreshData.session?.access_token) {
        console.log('✅ Token refreshed successfully');
        return refreshData.session.access_token;
      }
    }
    
    if (!session.access_token) {
      console.log('❌ No access token in session');
      return null;
    }
    
    console.log('✅ Session found, user:', session.user?.email || session.user?.id);
    console.log('✅ Token exists, length:', session.access_token.length);
    console.log('⏰ Token expires in:', timeUntilExpiry, 'seconds');
    
    return session.access_token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to sign in anonymously with request tracking
export const signInAnonymously = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('Error signing in anonymously:', error);
      return null;
    }
    
    // Update user metadata after sign in
    if (data.session?.user) {
      await supabase.auth.updateUser({
        data: {
          user_type: 'anonymous',
          request_count: 0,
          max_requests: 2,
          created_at: new Date().toISOString()
        }
      });
    }
    
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    return null;
  }
};

// Helper function to check and increment request count
export const checkAndIncrementRequestCount = async (): Promise<{ canMakeRequest: boolean; remainingRequests: number; isAnonymous: boolean }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { canMakeRequest: false, remainingRequests: 0, isAnonymous: false };
    }

    const userMetadata = session.user.user_metadata;
    const isAnonymous = userMetadata?.user_type === 'anonymous';
    
    if (!isAnonymous) {
      // Registered users have unlimited requests
      return { canMakeRequest: true, remainingRequests: -1, isAnonymous: false };
    }

    const currentCount = userMetadata?.request_count || 0;
    const maxRequests = userMetadata?.max_requests || 2;
    
    if (currentCount >= maxRequests) {
      return { canMakeRequest: false, remainingRequests: 0, isAnonymous: true };
    }

    // Increment the request count
    const newCount = currentCount + 1;
    const { error } = await supabase.auth.updateUser({
      data: {
        ...userMetadata,
        request_count: newCount
      }
    });

    if (error) {
      console.error('Error updating request count:', error);
      return { canMakeRequest: false, remainingRequests: 0, isAnonymous: true };
    }

    return { 
      canMakeRequest: true, 
      remainingRequests: maxRequests - newCount, 
      isAnonymous: true 
    };
  } catch (error) {
    console.error('Error checking request count:', error);
    return { canMakeRequest: false, remainingRequests: 0, isAnonymous: false };
  }
};

// Helper function to get current request status
export const getRequestStatus = async (): Promise<{ remainingRequests: number; isAnonymous: boolean; maxRequests: number }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { remainingRequests: 0, isAnonymous: false, maxRequests: 0 };
    }

    const userMetadata = session.user.user_metadata;
    const isAnonymous = userMetadata?.user_type === 'anonymous';
    const currentCount = userMetadata?.request_count || 0;
    const maxRequests = userMetadata?.max_requests || 2;
    
    return { 
      remainingRequests: isAnonymous ? Math.max(0, maxRequests - currentCount) : -1, 
      isAnonymous, 
      maxRequests 
    };
  } catch (error) {
    console.error('Error getting request status:', error);
    return { remainingRequests: 0, isAnonymous: false, maxRequests: 0 };
  }
};
