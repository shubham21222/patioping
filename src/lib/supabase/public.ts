import { createClient } from "@supabase/supabase-js";

/** Anon client with no session, for public pages (SEO city pages). RLS + RPC grants apply. */
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
