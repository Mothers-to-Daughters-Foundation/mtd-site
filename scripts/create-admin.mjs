/**
 * Admin Account Seeder
 *
 * Creates the initial admin account in Supabase.
 * Credentials are read entirely from environment variables — never hard-coded.
 *
 * Usage:
 *   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> \
 *   ADMIN_EMAIL=<email> ADMIN_PASSWORD=<password> \
 *   ADMIN_NAME=<name> \
 *   node scripts/create-admin.mjs
 *
 * Required environment variables:
 *   SUPABASE_URL              - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key (never expose this in client code)
 *   ADMIN_EMAIL               - Email address for the admin account
 *   ADMIN_PASSWORD            - Password for the admin account (min 8 chars)
 *   ADMIN_NAME                - Display name for the admin account
 */

import { createClient } from '@supabase/supabase-js';

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_NAME,
} = process.env;

const missing = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_NAME'].filter(
  (key) => !process.env[key]
);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// Basic URL validation
try {
  new URL(SUPABASE_URL);
} catch {
  console.error(`SUPABASE_URL is not a valid URL: "${SUPABASE_URL}"`);
  process.exit(1);
}

if (SUPABASE_SERVICE_ROLE_KEY.length < 20) {
  console.error('SUPABASE_SERVICE_ROLE_KEY appears to be invalid (too short).');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  email_confirm: true,
  user_metadata: {
    name: ADMIN_NAME,
    role: 'admin',
  },
});

if (error) {
  console.error('Failed to create admin account:', error.message);
  process.exit(1);
}

console.log(`Admin account created successfully: ${data.user.email} (id: ${data.user.id})`);
