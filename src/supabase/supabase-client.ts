import { createClient } from '@supabase/supabase-js';

// Ensure that you have SUPABASE_URL and SUPABASE_ANON_KEY in your environment variables
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
