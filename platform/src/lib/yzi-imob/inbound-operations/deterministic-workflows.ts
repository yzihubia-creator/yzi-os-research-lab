import type { WorkflowKey } from "./types.ts";

const WORKFLOW_MESSAGES: Record<WorkflowKey, string> = {
  whatsapp_greeting_response:
    "Oi! Recebi sua mensagem e sigo por aqui. Se quiser, me diga qual imovel ou assunto voce quer tratar.",
  qualify_property_interest:
    "Perfeito. Me envie o codigo ou link do imovel que chamou sua atencao para eu seguir com o contexto certo.",
  collect_scheduling_context:
    "Consigo seguir com isso. Me diga a data desejada e se prefere manha, tarde ou noite.",
  route_to_human:
    "Entendi. Vou registrar seu pedido de atendimento humano e seguir sem prometer transferencia imediata.",
  ask_clarifying_question:
    "Para eu te responder direito, me diga em uma frase se voce quer falar de imovel, visita ou atendimento humano.",
};

export function buildDeterministicWorkflowMessage(workflowKey: WorkflowKey): string {
  const message = WORKFLOW_MESSAGES[workflowKey];
  if (!message) {
    throw new Error("workflow_message_missing");
  }
  return message;
}
