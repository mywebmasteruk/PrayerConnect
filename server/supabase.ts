import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Get API keys from environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.ANON_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  throw new Error('VITE_SUPABASE_URL and ANON_KEY must be set for Supabase connection');
}

// Create and export the Supabase client for server-side usage
export const supabase = createClient<Database>(SUPABASE_URL, ANON_KEY);