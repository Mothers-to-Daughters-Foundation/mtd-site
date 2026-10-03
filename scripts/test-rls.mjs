// Verify the messaging RLS recursion (42P17) is gone by evaluating the
// policies as the `authenticated` role (the context that used to crash).
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
if (existsSync(join(root, '.env.local'))) {
  for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const REF = process.env.SUPABASE_PROJECT_REF || 'vhtnwxbfpnzjslctabyv';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

async function runSql(query) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${REF}/database/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }
  );
  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text };
}

// A throwaway uuid standing in for auth.uid().
const fakeUid = '00000000-0000-0000-0000-000000000001';

async function check(label, table) {
  const sql = `
    set local role authenticated;
    set local "request.jwt.claims" = '{"sub":"${fakeUid}","role":"authenticated"}';
    select count(*) as n from public.${table};
  `;
  const r = await runSql(sql);
  if (r.ok) {
    console.log(`${label}: OK (no recursion) -> ${r.body}`);
  } else if (r.body.includes('42P17') || r.body.toLowerCase().includes('infinite recursion')) {
    console.log(`${label}: STILL RECURSING (42P17)`);
  } else {
    console.log(`${label}: error ${r.status} -> ${r.body}`);
  }
}

await check('conversation_members (as authenticated)', 'conversation_members');
await check('messages (as authenticated)', 'messages');
