import { createClient } from "@supabase/supabase-js";

// Service-role client: VOLLEDIGE rechten, slaat RLS over. ALLEEN server-side gebruiken.
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
