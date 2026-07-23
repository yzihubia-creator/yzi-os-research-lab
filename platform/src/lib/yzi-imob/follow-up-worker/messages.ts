import type { FollowUpTaskContext } from "./types.ts";

function trimToSentence(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    return fallback;
  }
  return trimmed.length > 180 ? `${trimmed.slice(0, 177)}...` : trimmed;
}

export function buildFollowUpWhatsappBody(context: FollowUpTaskContext): string {
  switch (context.kind) {
    case "next_action_due":
      return `Oi! Ficou pendente esta proxima acao: ${trimToSentence(
        context.notes,
        "retomar nosso contato sobre o imovel",
      )}. Se fizer sentido, me diga como prefere seguir.`;
    case "lead_stalled":
      return "Oi! Retomando nosso contato sobre o imovel. Se ainda fizer sentido, posso seguir com opcoes, visita ou atendimento humano.";
    case "conversation_waiting_reply":
      return `Oi! Vi sua ultima mensagem${context.latestMessageBody?.trim() ? " e sigo por aqui para continuar" : ""}. Se quiser, posso avancar com imovel, visita ou atendimento humano.`;
    default:
      throw new Error("follow_up_whatsapp_not_supported");
  }
}
