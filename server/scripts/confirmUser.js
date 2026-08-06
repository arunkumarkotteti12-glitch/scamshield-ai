import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function confirmUserEmail(targetEmail) {
  console.log(`====================================================`);
  console.log(`🔍 Searching for user: ${targetEmail}`);
  console.log(`====================================================`);

  // 1. List users from Supabase Auth Admin API
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('❌ Failed to list users:', listError.message);
    return;
  }

  const user = users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());

  if (!user) {
    console.log(`⚠️ User ${targetEmail} not found in auth.users. Creating and auto-confirming user...`);
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: targetEmail,
      email_confirm: true,
      user_metadata: { email_verified: true }
    });

    if (createError) {
      console.error('❌ Failed to create user:', createError.message);
    } else {
      console.log(`✅ Successfully created and auto-confirmed user: ${targetEmail} (ID: ${newUser.user.id})`);
    }
    return;
  }

  console.log(`👤 Found user ${user.email} (ID: ${user.id}). Updating email_confirmed_at...`);

  // 2. Update user to email_confirm: true
  const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    {
      email_confirm: true,
      user_metadata: { ...user.user_metadata, email_verified: true }
    }
  );

  if (updateError) {
    console.error('❌ Failed to confirm email:', updateError.message);
  } else {
    console.log(`🎉 SUCCESS! User ${targetEmail} has been marked as email-confirmed directly in auth.users!`);
    console.log(`Confirmed At: ${updatedUser.user.email_confirmed_at || new Date().toISOString()}`);
  }
}

confirmUserEmail('arunkumarkotteti01@gmail.com');
