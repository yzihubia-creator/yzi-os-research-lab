"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/auth/session";
import {
  readYziImobOnboardingProfileInput,
  saveYziImobOnboardingProfile,
} from "@/lib/tenant/onboarding";
import type { OperationalSettingsSaveState } from "./action-state";

// Configurações Operacionais — atualização do MESMO estado criado pelo
// onboarding, pela MESMA RPC governada (`save_yzi_imob_onboarding_profile`,
// upsert idempotente: preserva completed_at via coalesce e recria os convites
// pendentes da implantação sem duplicar). Nenhum SQL novo, nenhuma RPC nova,
// nenhum tenant_id vindo do cliente: a RPC resolve o tenant pelo auth.uid().
// A validação do payload reutiliza readYziImobOnboardingProfileInput — o
// contrato de entrada é idêntico ao do onboarding.

const SAVE_ERROR =
  "Não foi possível salvar as alterações agora. Suas edições continuam nesta tela — tente novamente.";

function result(
  previous: OperationalSettingsSaveState,
  status: "saved" | "error",
  message?: string,
): OperationalSettingsSaveState {
  return { status, message, revision: previous.revision + 1 };
}

export async function saveOperationalSettingsAction(
  previous: OperationalSettingsSaveState,
  formData: FormData,
): Promise<OperationalSettingsSaveState> {
  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    redirect("/login");
  }

  const parsed = readYziImobOnboardingProfileInput(formData.get("payload"));
  if (parsed.status === "invalid") {
    return result(previous, "error", parsed.message);
  }

  const saved = await saveYziImobOnboardingProfile(supabase, parsed.input);

  if (saved.status === "ok") {
    revalidatePath("/cockpit/yzi-imob/configuracoes");
    return result(previous, "saved", "Alterações salvas.");
  }
  if (saved.status === "invalid") {
    return result(previous, "error", saved.message);
  }
  if (saved.status === "forbidden") {
    return result(
      previous,
      "error",
      "Somente quem administra a operação pode alterar estas configurações.",
    );
  }
  if (saved.status === "ambiguous_tenant") {
    return result(
      previous,
      "error",
      "Sua conta administra mais de uma operação ativa. Selecione a operação correta antes de salvar.",
    );
  }
  return result(previous, "error", SAVE_ERROR);
}
