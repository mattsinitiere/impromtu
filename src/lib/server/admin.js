import "server-only";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/* Service-role client. Bypasses RLS: use only after verifying who is asking. */
let admin = null;
export function supabaseAdmin() {
  if (admin) return admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Server is missing SUPABASE_SERVICE_ROLE_KEY.");
  admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}

/* Resolve the caller from `Authorization: Bearer <supabase access token>`.
   Returns the auth user or null. */
export async function userFromRequest(req) {
  const h = req.headers.get("authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7).trim() : "";
  if (!token) return null;
  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export function json(body, status = 200) {
  return NextResponse.json(body, { status });
}
export function fail(code, message, status) {
  return NextResponse.json({ error: { code, message } }, { status });
}

/* Wrap a route handler so an unexpected throw (most often a missing env
   var) becomes a JSON 500 with the message, not an empty response. */
export function route(fn) {
  return async (req) => {
    try { return await fn(req); }
    catch (e) { console.error("route error:", e); return fail("server", e.message || "Server error.", 500); }
  };
}
