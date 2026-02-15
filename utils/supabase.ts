
import { createClient } from '@supabase/supabase-js';

// Official Cloud One Technologies Supabase Configuration
const SUPABASE_URL = 'https://cbjgutquxipwykfiteck.supabase.co';
// NOTE: Ensure this is the "anon" "public" key from your Supabase Project Settings > API
const SUPABASE_ANON_KEY = 'sb_publishable_XPkSR7gL_o1kO-fTU57GHA_jSITeYUM';

/**
 * Initialize the real Supabase client.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'cloud-one-auth-token'
  }
});

/**
 * Robust error handling for cloud database transactions
 */
export const handleSupabaseError = (error: any, context: string) => {
  console.error(`[Supabase ${context}] Error Details:`, error);
  
  const message = error?.message || '';

  if (message.includes('Failed to fetch')) {
    return 'Cloud Connectivity Error: The server is unreachable. Check your internet or Supabase URL.';
  }
  
  if (message.includes('Invalid login credentials')) {
    return 'Authentication Failed: Invalid email or password. If you just created this account in the dashboard, please ensure "Confirm Email" is disabled in Supabase Auth settings, or verify the email.';
  }

  if (error?.status === 401 || error?.status === 403) {
    return 'Access Denied: Your API key may be invalid or restricted by RLS policies.';
  }

  return message || 'A synchronization error occurred.';
};
