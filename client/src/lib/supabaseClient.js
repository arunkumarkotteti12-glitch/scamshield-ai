import { createClient } from '@supabase/supabase-js';

// Production defaults so Vercel builds work out-of-the-box without missing env errors
const DEFAULT_SUPABASE_URL = 'https://knzysxlzvktgajwosnka.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuenlzeGx6dmt0Z2Fqd29zbmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5ODQ0NzIsImV4cCI6MjEwMTU2MDQ3Mn0.6b9X1SR8TpRFKOaRaQoGya0qtWI847m-bw04_fDHkac';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-project')
    ? import.meta.env.VITE_SUPABASE_URL
    : DEFAULT_SUPABASE_URL;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY && !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('your_supabase_anon_key')
    ? import.meta.env.VITE_SUPABASE_ANON_KEY
    : DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
