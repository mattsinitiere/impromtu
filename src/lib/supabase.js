"use client";
import { createClient } from "@supabase/supabase-js";

let client = null;

/* One browser client for the whole app. Returns null when the env vars are
   missing so the app still runs as a guest-only static site.

   Implicit flow on purpose: confirmation and password-reset links then carry
   their tokens in the URL fragment and work in whichever browser the email
   is opened in. PKCE (the default) needs the verifier from the browser that
   started the sign-up, which fails the common "signed up on the laptop, opened
   the email on the phone" case. */
export function supabase() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, {
    auth: { flowType: "implicit", detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
  });
  return client;
}

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function siteOrigin() {
  return typeof window !== "undefined" ? window.location.origin : "";
}
