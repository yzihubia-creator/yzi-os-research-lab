# YZI IMOB — Visit Orchestration Capability Spec v0.1 (rev. 1)

Especificação documentária da capability **Visit Orchestration**. Complementa `yzi-imob-property-catalog-capability-spec-v0.1.md`, `yzi-imob-assignment-engine-capability-spec-v0.1.md` e `yzi-imob-crm-financial-relation-model-v0.1.md`. Sem implementação.

Invariantes do Execution Pack — tenant boundary, human-in-the-loop, evidence, approval, estados honestos — aplicam-se **por referência** e não são repetidas aqui.

Princípio de identidade: **a capability resolve um problema operacional; não é definida por API, MCP, SDK ou provider.** Google Calendar é um provider possível do Availability Provider — detalhe de implementação, nunca identidade da capability.

## 1. Objetivo

Transformar a intenção de visita de um cliente em um agendamento confiável, respeitando a política de visitas do tenant, a disponibilidade real e o corretor certo — sem nunca confirmar visita sem checagem honesta de disponibilidade.

Problema operacional que resolve: *"como marco visitas sem conflito de agenda, sem lead esperando resposta e sem depender de troca manual de mensagens entre corretores?"*

## 2. Valor para o negócio

- **Problema que resolve:** agendamento manual gera conflito de horário, lead abandonado no meio da conversa e visita marcada com o corretor errado.
- **Ganho operacional:** visita proposta e confirmada com disponibilidade verificada, corretor adequado e registro completo — sem ida-e-volta manual.
- **Decisão que melhora:** quando e com quem realizar cada visita, e leitura gerencial de quantas visitas a operação realmente sustenta.

## 3. Fluxo

`Cliente → Preferência de dias → Availability Provider → Visit Policy → Disponibilidade → Escolha do corretor → Confirmação → Agenda → Kanban → Evidence`

- **Cliente** manifesta interesse em visitar um imóvel e informa janelas possíveis.
- **Availability Provider**: fonte de verdade de compromissos existentes (Google Calendar é um provider possível; hoje conceitual/manual, ver `yzi-imob-api-setup-inventory-v0.1.md`).
- **Visit Policy** define as regras de visita do tenant (seção 5).
- **Disponibilidade** = preferência do cliente ∩ compromissos ∩ Visit Policy.
- **Escolha do corretor**: aplicação do **Assignment Engine** (capability canônica) restrita aos corretores com slot na janela.
- **Confirmação** fecha o horário e prepara a comunicação às partes.
- **Agenda** registra o compromisso (única + individual); **Kanban** reflete a visita no pipeline; **Evidence** registra a decisão.

## 4. Estrutura da capability

- **Preference Intake** — organiza a preferência de dias/período do cliente.
- **Availability Provider** — abstração de leitura de compromissos existentes; nunca escreve sem confirmação.
- **Visit Policy Engine** — aplica a política de visitas do tenant (separada das regras gerais do tenant).
- **Availability Resolver** — monta os slots realmente livres.
- **Assignment (via Assignment Engine)** — recomenda o corretor do slot; a lógica vive na capability canônica, não aqui.
- **Confirmation Handler** — fecha o compromisso e prepara a comunicação.
- **Agenda Writer** — registra na agenda única (imobiliária) e individual (corretor), sempre em conjunto.
- **Kanban Sync** — reflete a visita como card no pipeline comercial.
- **Evidence Recorder** — registra contexto, decisão e resultado.

## 5. Visit Policy (separada das regras gerais do tenant)

Política **específica de visitas**, versionável por tenant: horário de atendimento para visitas; antecedência mínima; duração padrão por tipo de imóvel; bloqueio de imóvel não visitável (vendido, em reforma, sem chave); limite de visitas simultâneas por corretor; janela de cancelamento/remarcação; feriados e exceções.

Regra forte: `Nenhum slot é oferecido ao cliente sem passar pela Visit Policy e pelo Availability Resolver.`

Estrutura de decisão: **Hard Rules** eliminam slots (fora do horário, imóvel bloqueado, conflito de agenda) · **Business Rules** restringem (antecedência, limite por corretor, janela de remarcação) · **Ranking** prioriza os slots restantes (proximidade da preferência do cliente, urgência comercial do imóvel, equilíbrio de carga).

## 6. Workflows

`VISIT_PREFERENCE_CAPTURE` · `VISIT_AVAILABILITY_CHECK` · `VISIT_POLICY_APPLY` · `VISIT_AVAILABILITY_RESOLVE` · `VISIT_ASSIGNMENT_SELECT` (delega ao Assignment Engine) · `VISIT_CONFIRMATION_REQUEST` (aprovação humana conforme política do tenant) · `VISIT_AGENDA_WRITE` · `VISIT_KANBAN_SYNC` · `VISIT_EVIDENCE_RECORD`

Parada honesta quando faltar disponibilidade, corretor elegível ou autorização. Toda proposta de slot/corretor é **explicável**: a YZI declara quais fatores pesaram (janela do cliente, política, carga) e por que aquele slot/corretor foi proposto.

## 7. Availability Provider

Abstração da fonte de compromissos. Contrato conceitual: leitura de disponibilidade por corretor; escrita de evento **apenas após confirmação**; nunca sobrescreve evento existente sem checagem de conflito; falha de leitura/escrita é estado honesto (`availability_unavailable`), nunca visita confirmada sem verificação. Google Calendar, agenda interna ou registro manual são providers intercambiáveis — a capability não muda.

## 8. Agenda única e agenda individual

- **Agenda única** — visão consolidada da imobiliária: todas as visitas, todos os corretores, leitura gerencial e detecção de conflito global.
- **Agenda individual** — visão por corretor, para o dia a dia operacional.

Toda escrita atualiza as duas de forma consistente; nenhuma visita existe em uma sem refletir na outra.

## 9. Kanban e Evidence

Cada visita vira card no pipeline (`visita agendada → realizada → feedback registrado → próxima etapa do deal`). O Kanban nunca ganha etapa nova sem evidence do agendamento. Evidence registra: preferência original, política aplicada, slots considerados, corretor proposto e motivo, confirmação (quem/quando), estado da agenda no momento.

## 10. Estados honestos

`preference_captured` · `checking_availability` · `availability_unavailable` · `no_slot_available` · `no_broker_available` · `slot_proposed` · `awaiting_confirmation` · `confirmed` · `agenda_updated` · `kanban_synced` · `evidence_recorded` · `cancelled` · `rescheduled`

## 11. Future Capability — Route Intelligence

Nota arquitetural: quando houver volume de visitas, uma futura capability **Route Intelligence** poderá otimizar rotas e sequência de visitas por corretor (agrupar por região, reduzir deslocamento, propor janelas encadeadas). Registrada aqui como evolução natural; **não faz parte desta spec e não deve ser criada agora**.

## 12. Próxima Capability

**Esta capability entrega:** visita confirmada com corretor, agenda consistente, card no pipeline e evidence completo.

**Consumida por:** Pipeline comercial / Kanban (progresso do deal) · Lead Intelligence (visita realizada/feedback como sinal de padrão) · Assignment Engine (resultado da visita realimenta score do corretor) · Operating Surface / módulos Atendimento e Clientes.

## 13. Fora do escopo

Sem implementação, código, SQL, API, conexão real a provider de agenda, banco, notificação real ou efeito externo. Mapa da capability para autorização futura.
