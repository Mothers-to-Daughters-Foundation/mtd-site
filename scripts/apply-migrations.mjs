// One-off: apply the pending SQL migrations to Supabase via the Management API
// and verify. Uses a Personal Access Token (PAT) — NOT the database password,
// so it does not touch the pooler, read replicas, or any app credentials.
//
// Usage:
//   1. Create a PAT: Supabase Dashboard -> Account -> Access Tokens -> Generate.
//      (It's independent of the DB password and revocable at any time.)
//   2. Add it to .env.local:
//        SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//   3. node scripts/apply-migrations.mjs
//
// Safe to re-run: both migrations are idempotent.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnv() {
  const envPath = join(root, '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

loadEnv();

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'vhtnwxbfpnzjslctabyv';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!TOKEN) {
  console.error(
    'Missing SUPABASE_ACCESS_TOKEN in .env.local (a Supabase Personal Access Token, sbp_...).'
  );
  process.exit(1);
}

const API = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

async function runSql(query) {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const migrations = [
  'supabase/migrations/0001_fix_messaging_rls.sql',
  'supabase/migrations/0002_avatars_storage_policy.sql',
];

async function main() {
  for (const rel of migrations) {
    const sql = readFileSync(join(root, rel), 'utf8');
    process.stdout.write(`Applying ${rel} ... `);
    await runSql(sql);
    console.log('done');
  }

  console.log('\n--- Verification ---');

  const fn = await runSql(
    `select proname from pg_proc where proname = 'is_conversation_member'`
  );
  console.log(
    `is_conversation_member() exists: ${
      Array.isArray(fn) && fn.length > 0 ? 'yes' : 'NO'
    }`
  );

  const pol = await runSql(
    `select tablename, policyname from pg_policies
     where schemaname = 'public' and tablename in ('conversation_members','messages')
     order by tablename, policyname`
  );
  console.log('messaging policies:');
  (Array.isArray(pol) ? pol : []).forEach((r) =>
    console.log(`  ${r.tablename}.${r.policyname}`)
  );

  const bucket = await runSql(
    `select public from storage.buckets where id = 'avatars'`
  );
  console.log(
    `avatars bucket public: ${
      Array.isArray(bucket) && bucket.length > 0 ? bucket[0].public : 'MISSING'
    }`
  );

  const spol = await runSql(
    `select policyname from pg_policies
     where schemaname = 'storage' and tablename = 'objects'
       and policyname like 'avatars_%'
     order by policyname`
  );
  console.log('avatars storage policies:');
  (Array.isArray(spol) ? spol : []).forEach((r) =>
    console.log(`  storage.objects.${r.policyname}`)
  );

  console.log('\nAll migrations applied and verified.');
}

main().catch((err) => {
  console.error('\nMigration failed:', err.message);
  process.exit(1);
});
