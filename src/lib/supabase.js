"use client";
import { createBrowserClient } from "@supabase/ssr";

let client = null;

/* One browser client for the whole app. Returns null when the env vars are
   missing so the app still runs as a guest-only static site. */
export function supabase() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client = createBrowserClient(url, key);
  return client;
}

export const AUTH_DOMAIN = "impromptu.app";
export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function usernameToEmail(username) {
  return username.trim().toLowerCase() + "@" + AUTH_DOMAIN;
}
