"use server";

import { createServerSupabaseClient } from "@/lib/auth/session";
import {
  startMetaOAuthAuthorization,
  type StartMetaOAuthInput,
  type StartMetaOAuthResult,
} from "@/lib/yzi-imob/connections/meta-oauth-start";

export async function startMetaOAuthAuthorizationAction(
  input: StartMetaOAuthInput,
): Promise<StartMetaOAuthResult> {
  const supabase = await createServerSupabaseClient();
  return startMetaOAuthAuthorization(supabase, input);
}
