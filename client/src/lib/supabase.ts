import { createClient } from '@neondatabase/serverless';

// Get API keys from environment variables with fallback
const SUPABASE_URL = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || import.meta.env.VITE_SUPABASE_KEY;

// Create and export the Supabase client (if we have the credentials)
export const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }
  return supabase;
}
