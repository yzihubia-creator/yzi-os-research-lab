# YZI OS — Plano de Execução Controlada

> **Documento de processo (ponte).** Define **como** o YZI OS sai dos mapas `architecture-only`
> para specs individuais controladas, skills, subagentes, harnesses, services/tools e, por fim,
> código — **sem cair em implementação prematura**. Este documento **não** cria nenhuma dessas
> peças executáveis: ele define o **processo de governança e autorização** das próximas fases. A
> arquitetura continua sendo o produto.
>
> Camada: `implementation` (processo) · Status: canônico · Versão: v1 · Data: 2026-06-03
> Natureza: architecture/process-only · governance-first · spec-driven · checkpoint-based ·
> anti-implementação-prematura.

---

## 1. Propósito da Fase 7

A Fase 7 entrega um **plano de execução controlada**: o processo institucional que rege a transição
do YZI OS de uma base **documental/arquitetural** para a **construção controlada** das peças
executáveis. Ele responde a uma pergunta de governança, não de engenharia:

> **Quando, sob quais critérios e com qual autorização** uma classe de operação já mapeada pode
> virar spec individual, depois skill/subagente/harness/service-tool e, só ao final, código — sem
> que nenhuma etapa anteceda a sua autorização?

"Plano de execução" aqui significa **processo de governança e autorização das próximas fases**, e
**nunca** um plano técnico de implementação, sprint plan, backlog ou roadmap de código.

---

## 2. Posição da Fase 7 dentro do YZI OS Research Lab

O projeto já concluiu e aprovou seis fases architecture-only:

| Fase | Entrega aprovada |
| --- | --- |
| 1 | Foundation — [`/docs/foundation/`](../foundation/) |
| 2 | Arquitetura e camadas institucionais — [`/docs/architecture/`](../architecture/) e camadas de engenharia |
| 3 | [PRD](../prd/yzi-os-prd-v1.md) + [README](../README.md) |
| 4 | [Specification Map](../specification-engineering/specification-map.md) — 47 specs futuras |
| 5 | [Skill Map](../skills/skill-map.md) + [Subagent Map](../subagents/subagent-map.md) |
| 6 | [Operational Harness Map](../harness-engineering/operational-harness-map.md) — 9 harnesses futuros |

Posição da Fase 7 no caminho Spec-Driven:

> mapas institucionais → **[ESTE: Plano de Execução Controlada]** → specs `.spec.md` → skills →
> subagentes → harnesses → services/tools → código.

A Fase 7 é a **ponte processual** entre os mapas (o *quê*) e a construção controlada (o *quando* e
*sob qual autorização*). Ela **não** duplica o conteúdo dos mapas anteriores — apenas **referencia**
a lógica já consolidada e a transforma em um processo de transição governado.

---

## 3. Princípios de execução controlada

1. **Governance-first.** Nenhuma peça é criada antes da governança que a autoriza e verifica. A
   ordem de valores permanece: verdade operacional › segurança › isolamento multi-tenant ›
   auditabilidade › governança › continuidade › desacoplamento › leveza do runtime.
2. **Spec-driven real.** Só se constrói o que tem **spec aprovada** com método de verificação
   definido (contract-first). Sem spec, não há skill/subagente/harness/tool/código.
3. **Uma peça por vez.** A criação é incremental e atômica: uma spec, um checkpoint, uma aprovação.
   Lotes não são autorizados.
4. **Autoridade decrescente preservada.** Em toda fase, o LLM/agente de código permanece sem
   autoridade operacional; estado, services e policies governam.
5. **Dependência antes de dependente.** Nenhuma peça de onda superior é criada antes das suas
   dependências de onda inferior (cadeia do Specification Map).
6. **Evidência obrigatória.** Cada transição de fase produz um checkpoint reconstruível; nenhuma
   fase avança sem registro de aprovação.
7. **Reversibilidade documental.** Toda decisão de processo é revisável por humano; nada se torna
   irreversível por inferência do modelo.
8. **Anti-implementação prematura.** A dúvida resolve-se **sempre** a favor de adiar a construção,
   não de antecipá-la.

---

## 4. Regra de checkpoint por fase

Toda fase futura segue o mesmo protocolo de checkpoint, já praticado nas Fases 1–6:

1. **Brief explícito do operador** define objetivo, arquivo(s), estrutura obrigatória e guardrails.
2. **Execução architecture/process-only ou de criação controlada** estritamente dentro do brief.
3. **Checkpoint de encerramento** contendo: arquivo(s) criado(s)/alterado(s); decisões
   consolidadas; ambiguidades/reconstruções sinalizadas; confirmação de que nada proibido foi
   criado.
4. **Parada e espera de aprovação explícita.** A próxima fase só inicia após autorização nominal.
5. **Most-recent/most-detailed governa** quando instruções conflitam; a reconciliação é declarada
   no checkpoint.

Nenhuma fase é autocontinuada. Cada avanço é um ato de autorização do operador.

---

## 5. Formato padrão das futuras specs `.spec.md`

Quando (e somente quando) uma spec for autorizada, ela seguirá um **formato documental em
linguagem natural estruturada** — revisável por humano. **Não** se usará YAML, JSON, schema,
contrato machine-readable, DSL ou pseudo-código.

Template de referência (a ser preenchido na fase própria, não agora):

```
# <nome-da-spec>

- Nome:
- Camada:
- Owner arquitetural:
- Propósito:
- Problema que resolve:
- Autoridade envolvida:
- Entradas esperadas:
- Saídas esperadas:
- Contrato esperado (linguagem natural):
- Método de verificação:
- Critérios de aceite:
- Dependências:
- Riscos arquiteturais evitados:
- Observabilidade esperada:
- Relação com skills / subagentes / harnesses / services / tools:
- Fora de escopo:
- Proveniência:
```

O bloco acima é um **molde documental**, não um contrato executável. Ele organiza prosa revisável;
não introduz sintaxe de máquina. **Nesta Fase 7 nenhuma spec individual é criada.**

---

## 6. Critérios de aceite para uma spec

Uma futura spec só é aceita quando:

1. Descreve **uma única classe de operação verificável** (não um agregado).
2. Tem **método de verificação preciso** — sem verificação, não há spec (contract-first).
3. Declara sua **autoridade envolvida** sem atribuir decisão ao LLM/agente.
4. Declara seu **tenant-scope** (Global / Per-tenant / Global-instância).
5. Lista **dependências** já existentes ou já aprovadas (nenhuma dependência pendente).
6. Define **observabilidade esperada** (que evidência/trace produz).
7. Nomeia os **riscos arquiteturais evitados** e a **proveniência** teórica.
8. É **reconstruível e revisável por humano** — prosa estruturada, não sintaxe de máquina.
9. **Não** colapsa as seis preocupações (linguagem, operação, estado, governança, execução,
   observabilidade).
10. Resolve conflitos por **ordem de valores**, nunca por numeração de princípio.

---

## 7. O que uma spec pode conter

Uma futura spec **pode** conter, em linguagem natural estruturada: nome; camada; owner
arquitetural; propósito; problema que resolve; autoridade envolvida; entradas esperadas; saídas
esperadas; contrato esperado (NL); método de verificação; critérios de aceite; dependências; riscos
arquiteturais evitados; observabilidade esperada; relação com skills/subagentes/harnesses/
services/tools; fora de escopo; proveniência.

Todos os campos são **descritivos e revisáveis**, jamais executáveis.

---

## 8. O que uma spec não pode conter

Uma futura spec **não pode** conter: código; API; schema; frontend; microservices; backlog; sprint
plan; roadmap de código; plano técnico de implementação; YAML/JSON executável; contratos
machine-readable; DSL; pseudo-código; configuração real de skill/subagente; implementation harness;
prompt executável; inferência de stack técnica nova.

A spec **descreve o contrato**; ela **não o implementa**.

---

## 9. Ordem recomendada de criação das specs P0

A Onda P0 (fundacional/bloqueante do Specification Map) é a primeira a ser autorizada, **uma spec
por vez, com checkpoint por spec**:

1. `core-operational-principles` — fixa os 18 princípios + 10 corolários como invariantes
   verificáveis (raiz; bloqueia tudo).
2. `layer-authority-model` — distribuição de autoridade entre as 9 camadas + Paradoxo do Metadado.
3. `conflict-resolution` — resolução por ordem de valores (não por número).
4. `tenant-boundary` — fronteira multi-tenant como invariante de engenharia.

Só após a estabilização e aprovação de P0 abre-se P1 (State), e assim sucessivamente, conforme a
cadeia de dependências do [Specification Map §8](../specification-engineering/specification-map.md).

---

## 10. Quando uma spec pode virar skill

Quando — e somente quando — a spec aprovada satisfaz os **critérios de promoção a skill** do
[Skill Map §5](../skills/skill-map.md): é capacidade **modular, reutilizável e governada por
specification**, com entradas, saídas, limites, critérios de sucesso e observabilidade esperada
definidos. A skill **não** é prompt gigante, persona, comportamento solto nem instrução textual sem
contrato. Candidatas antecipadas: as specs com candidatura `skill` (p. ex. `context-assembly`).

---

## 11. Quando uma spec pode virar subagente

Quando a spec aprovada satisfaz os **critérios de promoção a subagente** do
[Subagent Map §5](../subagents/subagent-map.md): descreve um **papel operacional especializado,
governado por specification, com autoridade limitada, escopo claro, permissões explícitas e método
de verificação**. O subagente **compõe** skills (composição ≠ delegação) e **não** é chatbot nem
persona. Candidatas antecipadas: as specs do grupo Agent com candidatura `subagente`.

---

## 12. Quando uma spec pode virar harness

Quando a spec aprovada satisfaz os **critérios de promoção a harness** do
[Operational Harness Map §7](../harness-engineering/operational-harness-map.md): é **substrato de
coordenação/restrição/verificação/auditoria**, governado por specification, **sem autoridade sobre
a verdade operacional**, produtor de evidência obrigatória, respeitando o isolamento multi-tenant e
não-desativável pelo que fiscaliza. Os harnesses fundacionais (runtime, governance, observability,
tenant, execution) vêm antes dos posteriores (context, retrieval, audit, escalation).

---

## 13. Quando uma spec pode virar service/tool

Quando a spec aprovada descreve **decisão institucional dentro de contrato** (service) ou **execução
controlada de efeito sob permissão** (tool), conforme o grupo Service/Tool do Specification Map:

- **Service** — decide a operação dentro do contrato de specification; nenhuma decisão atribuível ao
  modelo.
- **Tool** — executa o efeito apenas via registro, com permissão explícita, trace e verificação de
  resultado; o modelo apenas **descreve** a invocação, nunca executa.

Service/tool só são autorizados **depois** dos harnesses que os coordenam (sobretudo
`execution-harness`).

---

## 14. Quando código fica autorizado

Código é a **última** etapa e só fica autorizado quando **todas** as condições se verificam:

1. As specs P0 estão aprovadas.
2. As specs das classes de operação a construir estão aprovadas, com verificação definida.
3. As skills, subagentes e harnesses mínimos correspondentes estão especificados e aprovados.
4. O **Implementation Harness / Spec Executor** está especificado e aprovado (Fase 12).
5. Existe método de verificação, observabilidade e trilha de auditoria para o que o código fará.

Antes disso, **nenhuma linha de código é autorizada**. Código sem spec, sem harness e sem
verificação é, por definição, implementação prematura.

---

## 15. Papel futuro de Claude Code e Codex

Claude Code e Codex são, na arquitetura do YZI OS, **executores probabilísticos sem autoridade
operacional** — equivalentes ao LLM na hierarquia de camadas. No futuro:

- **Operam sob harness**, nunca acima dele. Toda ação passa por permissão explícita, trace e
  verificação determinística do resultado.
- **Não decidem a verdade** (estado) nem **a operação** (services) nem **a regra de comportamento**
  (policies). Apenas **propõem e executam** dentro do que já está especificado e autorizado.
- **Só atuam após** as specs, harnesses e o Implementation Harness/Spec Executor estarem aprovados
  (Fases 8–12). São acionados na Fase 13 (código controlado), sob `execution-harness` e
  `audit-harness`.
- **Nenhuma execução sem trace.** Toda contribuição de um agente de código é episódio auditável,
  com atribuição de falha antes de qualquer correção.

Resumo: Claude Code e Codex são **ferramentas governadas**, não autoridades. A confiança permanece
na arquitetura, não no agente.

---

## 16. Como evitar implementação prematura

- **Gate de autorização por fase** — nada inicia sem brief e aprovação nominal (§4).
- **Contract-first absoluto** — sem spec aprovada com verificação, não há construção (§6).
- **Uma peça por vez** — proibição de lotes; cada criação é atômica e checkpointada (§3).
- **Dependência antes de dependente** — cadeia de ondas P0→P5 respeitada.
- **Viés de adiamento** — na dúvida, adia-se a construção (§3.8).
- **Guardrails explícitos** — a lista do §21 é verificada a cada fase.
- **Implementation Harness por último** — o executor de specs (Fase 12) só vem depois das specs e
  harnesses; jamais é antecipado.

---

## 17. Como preservar Spec-Driven Development real

Spec-Driven real significa que **a spec governa a peça, e não o contrário**:

1. A peça (skill/subagente/harness/tool/código) **nasce de uma spec aprovada**, nunca de prompt
   avulso ou intuição.
2. A spec tem **método de verificação**; a peça é aceita apenas se a verificação passa.
3. Mudança de comportamento exige **nova versão de spec**, não edição silenciosa da peça.
4. O comportamento é **reconstruível a partir de specs/policies/traces**, não da formulação do
   prompt (o prompt permanece Metadata — menor prioridade).
5. A trilha spec → peça → evidência é **auditável** ponta a ponta.

Sempre que uma peça for proposta sem spec correspondente, o processo **para** e exige a spec antes
de prosseguir.

---

## 18. Sequência futura recomendada

Recomendação (sem executar nenhuma destas fases agora):

| Fase | Foco | Natureza |
| --- | --- | --- |
| **8** | Specs P0, uma por uma (`core-operational-principles` → `layer-authority-model` → `conflict-resolution` → `tenant-boundary`) | criação controlada de specs `.spec.md`, checkpoint por spec |
| **9** | Skills mínimas (conjunto aprovado: intent-extraction, context-assembly, provenance-tagging, evidence-compilation) | specs de skill, governadas |
| **10** | Subagentes mínimos (interface, retrieval, verification) | specs de subagente, governadas |
| **11** | Harnesses mínimos (runtime, governance, observability, tenant; execution quando houver tool com efeito) | specs de harness, governadas |
| **12** | Implementation Harness / Spec Executor | especificação do executor de specs (ainda não código) |
| **13** | Código controlado | só após 8–12 aprovadas; sob harness, trace e verificação |

Cada fase é definida por brief próprio, executada com checkpoint e **só inicia após autorização
explícita**. A numeração é recomendação de ordem, não um cronograma.

---

## 19. Critério de conclusão da Fase 7

A Fase 7 está concluída quando:

1. O arquivo `/docs/implementation/controlled-execution-plan.md` existe e cobre as 19 seções
   exigidas.
2. O documento é **architecture/process-only**, governance-first, spec-driven, checkpoint-based e
   anti-implementação-prematura.
3. **Nenhuma** peça executável foi criada (nenhuma spec `.spec.md`, skill, subagente, harness,
   service/tool, código, backlog, sprint plan, roadmap de código ou plano técnico).
4. O documento **referencia** a lógica dos mapas anteriores sem duplicá-la.
5. O checkpoint de encerramento foi entregue e a aprovação do operador é aguardada.

---

## 20. Conformidade com os princípios da fundação

| Princípio | Como este plano o instancia |
| --- | --- |
| `P15` specifications governam contratos | §5–§8, §17: nada se constrói sem spec aprovada |
| `DO4` execução baseada em specification | §6, §14: código só após specs/harnesses aprovados |
| `P1`/`P6` LLM/runtime sem autoridade | §15: Claude Code/Codex como executores governados |
| `P8`/`P9` observabilidade e auditabilidade | §3.6, §15: nenhuma execução sem trace |
| `P10` multi-tenant por desenho | §6.4, §9: tenant-boundary entre as specs P0 |
| `P12` governança separada da linguagem | §3.1, §17: governance-first; prompt é Metadata |

Conflitos resolvem-se por **ordem de valores** de
[`principles.md`](../foundation/principles.md), nunca pela numeração.

---

## 21. Guardrails absolutos (verificados a cada fase)

Não criar, enquanto não autorizado por fase própria: spec individual / arquivo `.spec.md`; skill;
subagente; harness executável; implementation harness; backlog; sprint plan; roadmap de código;
plano técnico de implementação; código; API; schema; frontend; microservices; YAML/JSON executável;
contratos machine-readable; prompt executável de skill; configuração real de subagente; plano
técnico de deploy. Não inferir stack técnica nova. Não transformar o YZI OS em chatbot, SaaS
genérico ou wrapper de LLM. Não duplicar conteúdo dos documentos anteriores — apenas referenciar.

---

## 22. Fronteiras (o que NÃO está aqui)

- **Não** cria specs, skills, subagentes, harnesses, services/tools ou código.
- **Não** define plano técnico, backlog, sprint, roadmap de código ou deploy.
- **Não** introduz sintaxe de máquina (YAML/JSON/schema/DSL/pseudo-código).
- **Não** substitui os mapas anteriores: é o **processo** que rege a transição deles para a
  construção controlada.
- **Não** autoriza, por si, nenhuma fase futura — apenas as ordena e condiciona à autorização
  explícita do operador.
