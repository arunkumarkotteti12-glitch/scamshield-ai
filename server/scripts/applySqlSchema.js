import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function checkOrApply() {
  console.log('Testing Supabase project connection...');
  const { data, error } = await supabase.from('scans').select('*').limit(1);

  if (!error) {
    console.log('✅ Success! `scans` table exists and is accessible via service role.');
  } else {
    console.log('Notice:', error.message);
  }
}

checkOrApply();
