import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

// Client Supabase para o browser. Usa exclusivamente valores públicos
// (URL do projeto + anon/publishable key). Service role é proibida em
// qualquer ponto de platform/ (platform-foundation-execution-pack-v1).
let browserClient: SupabaseClient | undefined;

export function getSupabaseBrowserClient(): SupabaseClient {
  const { url, publishableKey } = getSupabasePublicEnv();

  if (!browserClient) {
    browserClient = createBrowserClient(url, publishableKey);
  }

  return browserClient;
}
