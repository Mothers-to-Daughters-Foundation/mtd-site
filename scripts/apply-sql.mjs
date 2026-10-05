// Apply SQL to Supabase via the Management API (PAT in .env.local).
// Usage: node scripts/apply-sql.mjs <file.sql | "SELECT ...">
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
if (!process.env.SUPABASE_PROJECT_REF) console.error(`Warning: SUPABASE_PROJECT_REF not set; defaulting to project ref '${REF}'`);
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) { console.error('Missing SUPABASE_ACCESS_TOKEN in .env.local'); process.exit(1); }

const arg = process.argv[2];
if (!arg) { console.error('Usage: node scripts/apply-sql.mjs <file.sql | "SQL">'); process.exit(1); }
const query = existsSync(arg) ? readFileSync(arg, 'utf8') : arg;

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
});
const text = await res.text();
if (!res.ok) { console.error(`HTTP ${res.status}: ${text}`); process.exit(1); }
console.log(text);
