import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { DEMO_SCANS } from './seedDemoData.js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function seedScansForUser() {
  console.log('Seeding demo scans for demo@scamshield.ai...');

  // 1. Get user id for demo@scamshield.ai
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError || !users) {
    console.error('Failed to list users:', listError);
    return;
  }

  const demoUser = users.find(u => u.email === 'demo@scamshield.ai');
  if (!demoUser) {
    console.error('demo@scamshield.ai user not found.');
    return;
  }

  console.log('Found demo user ID:', demoUser.id);

  // 2. Insert demo scans
  const records = DEMO_SCANS.map(item => ({
    user_id: demoUser.id,
    message_source: item.message_source,
    original_text: item.original_text,
    is_scam: item.is_scam,
    risk_score: item.risk_score,
    risk_level: item.risk_level,
    scam_type: item.scam_type,
    red_flags: item.red_flags,
    explanation: item.explanation,
    recommended_action: item.recommended_action
  }));

  const { data: inserted, error: insertError } = await supabase
    .from('scans')
    .insert(records)
    .select();

  if (insertError) {
    console.error('Error inserting demo scans:', insertError.message);
    if (insertError.message.includes("relation \"public.scans\" does not exist")) {
      console.log('👉 Please execute 001_initial_schema.sql in Supabase Dashboard SQL Editor first!');
    }
  } else {
    console.log(`✅ Successfully seeded ${inserted.length} demo scans for demo@scamshield.ai!`);
  }
}

seedScansForUser();
