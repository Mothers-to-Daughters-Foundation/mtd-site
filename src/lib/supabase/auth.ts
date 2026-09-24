import { createClient } from "./client";

const supabase = createClient();

export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signUp(
  email: string,
  password: string,
  metadata: {
    full_name: string;
    role: "mentor" | "mentee";
  }
) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  return await supabase.auth.getUser();
}

export async function getCurrentSession() {
  return await supabase.auth.getSession();
}