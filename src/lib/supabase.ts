import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing environment variables!');
}

// Client intended for public / client-side operations (respects row level security)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client with elevated privileges (bypasses RLS)
// This should ONLY be used in server actions or API routes, never on the frontend!
export const supabaseAdmin = supabaseServiceKey 
    ? createClient(supabaseUrl, supabaseServiceKey) 
    : supabaseClient;
