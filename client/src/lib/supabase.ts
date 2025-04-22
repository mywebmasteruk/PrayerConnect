import { createClient } from '@supabase/supabase-js';

// Get API keys from environment variables with fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.ANON_KEY;

// Create and export the Supabase client (if we have the credentials)
export const supabase = SUPABASE_URL && ANON_KEY
  ? createClient(SUPABASE_URL, ANON_KEY)
  : null;

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }
  return supabase;
}
