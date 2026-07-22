import type { SupabaseClient } from "@supabase/supabase-js";

import { createServerSupabaseClient } from "@/lib/auth/session";

// Mantem um unico contrato SSR para sessoes server-side em toda a aplicacao.
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  return createServerSupabaseClient();
}
