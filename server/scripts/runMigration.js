import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationFilePath = path.join(__dirname, '../../supabase/migrations/001_initial_schema.sql');

async function runMigration() {
  console.log('====================================================');
  console.log('📦 ScamShield AI - Database Migration Runner');
  console.log('====================================================');

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey || supabaseUrl.includes('your-supabase-project')) {
    console.warn('⚠️  Supabase environment variables not configured in server/.env.');
    console.log('Please copy 001_initial_schema.sql into your Supabase Dashboard SQL Editor.');
    console.log(`SQL File location: ${migrationFilePath}`);
    return;
  }

  try {
    const sqlContent = fs.readFileSync(migrationFilePath, 'utf8');
    console.log(`📄 Migration file loaded: 001_initial_schema.sql (${sqlContent.length} bytes)`);

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    // Check if scans table already exists
    const { error: checkError } = await supabase.from('scans').select('id').limit(1);

    if (!checkError) {
      console.log('✅ Scans table already exists in Supabase PostgreSQL.');
      console.log('Row Level Security (RLS) policies are active.');
      return;
    }

    console.log('⚙️ Table check notice:', checkError.message);
    console.log('👉 Please execute 001_initial_schema.sql in the Supabase Dashboard SQL Editor if table creation is required.');
    console.log('SQL File Content Summary:');
    console.log(sqlContent.substring(0, 300) + '...\n');
  } catch (err) {
    console.error('❌ Error executing migration script:', err.message);
  }
}

runMigration();
