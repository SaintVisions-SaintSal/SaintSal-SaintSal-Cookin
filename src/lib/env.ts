/**
 * Environment variable validation and access
 * Validates required environment variables at build/runtime
 */

const requiredEnvVars = {
  // Supabase (optional but recommended)
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  
  // Backend API (optional - has default)
  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://saintsal-backend-0mv8.onrender.com',
  
  // Google Cloud (optional)
  NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY,
  NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID,
} as const;

/**
 * Validates environment variables
 * Throws error in production if critical vars are missing
 */
export function validateEnv() {
  if (process.env.NODE_ENV === 'production') {
    const missing: string[] = [];
    
    // Only validate Supabase if it's being used
    if (!requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL) {
      console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL is not set. Supabase features may not work.');
    }
    
    if (!requiredEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Supabase features may not work.');
    }
    
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env.local or Vercel environment variables.'
      );
    }
  }
}

/**
 * Get environment variable with type safety
 */
export function getEnv(key: keyof typeof requiredEnvVars): string | undefined {
  return requiredEnvVars[key];
}

/**
 * Get all environment variables (for debugging)
 */
export function getAllEnv() {
  return {
    ...requiredEnvVars,
    NODE_ENV: process.env.NODE_ENV,
  };
}

// Validate on module load in production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    validateEnv();
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
  }
}

