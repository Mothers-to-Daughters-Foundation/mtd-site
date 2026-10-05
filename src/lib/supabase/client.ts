import { createBrowserClient } from "@supabase/ssr";

function browserEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export function createClient() {
  const env = browserEnv();
  if (!env) {
    throw new Error(
      "@supabase/ssr: Your project's URL and API key are required to create a Supabase client!"
    );
  }
  return createBrowserClient(env.url, env.key);
}

/** Null when the public site is built without Supabase env (GitHub Pages export). */
export function tryCreateClient() {
  const env = browserEnv();
  if (!env) return null;
  return createBrowserClient(env.url, env.key);
}
