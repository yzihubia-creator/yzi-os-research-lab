import { redirect } from "next/navigation";

import { AuthPanel } from "@/components/yzi-os/auth-panel";
import { GoogleOAuthLoginButton } from "@/components/yzi-os/google-oauth-login-button";
import { getSessionUser } from "@/lib/auth/session";

function messageFor(error: string | undefined): string | null {
  if (error === "oauth") {
    return "Não foi possível entrar com o Google. Tente novamente.";
  }
  return null;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (user) {
    redirect("/cockpit/yzi-imob");
  }

  const { error } = await searchParams;
  const message = messageFor(error);

  return (
    <AuthPanel
      eyebrow="YZI OS · acesso controlado"
      title="Entrar com Google"
      description="O acesso ao cockpit é controlado por Google OAuth. Nenhum tenant, lead ou dado operacional é mostrado nesta tela."
      note="Use sua conta Google autorizada para continuar até o Command Center. Se a autenticação falhar, a mensagem abaixo preserva apenas o estado necessário para orientar a tentativa."
      errorMessage={message}
      primaryAction={<GoogleOAuthLoginButton />}
    />
  );
}
