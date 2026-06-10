# context-isolation

> **Specification documental (governança-first, contract-first, linguagem natural estruturada).**
> Terceira spec do grupo **Context/Retrieval** da Onda P2. Define o **isolamento de contexto** no
> YZI OS: o contexto de cada operação/subagente/tenant tem **escopo explícito** e é **limitado por
> atenuação de privilégio**; o isolamento é **mecanismo de segurança, governança e controle
> operacional** que impede **poisoning, distraction, confusion e clash** e bloqueia qualquer vazamento
> entre papéis e tenants. **Não** é machine-readable: não contém YAML, JSON, schema, DSL, pseudo-código
> nem contrato técnico executável.
>
> Onda: P2 (governança + contexto) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `context-isolation` |
| **Camada** | `context-engineering` |
| **Owner arquitetural** | Contexto |
| **Tenant-scope** | Per-tenant |
| **Classe de operação** | isolamento-contextual / segurança |
| **Candidatura** | `harness` (`context-harness`) + subagentes com contexto atenuado |
| **Dependências** | [`context-assembly`](context-assembly.spec.md), [`context-lifecycle`](context-lifecycle.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md), [`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md), [`memory-model`](../p1/memory-model.spec.md), [`layer-authority-model`](../p0/layer-authority-model.spec.md) |
| **Proveniência** | `[CE]` `[PYR]` `[AHE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `DO2` (isolamento contextual), `P7`/isolamento multi-tenant, atenuação de privilégio.
- [`/docs/foundation/philosophy.md`](../../foundation/philosophy.md) §7 — isolamento e atenuação de privilégio; visibilidade restrita habilita segurança.
- [`/docs/specs/p2/context-assembly.spec.md`](context-assembly.spec.md) — critério **isolamento** do pacote; e [`context-lifecycle`](context-lifecycle.spec.md) — operação **isolate**.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, o **isolamento de contexto** no YZI OS: todo contexto
opera dentro de um **escopo explícito** e é **limitado por atenuação de privilégio** — um subagente,
papel ou operação recebe apenas o contexto **estritamente necessário**, nunca o contexto total do
sistema, do operador ou de outro tenant. O isolamento é **mecanismo de segurança, governança e controle
operacional**, não conveniência de implementação.

A spec **extrai** (não inventa nem resume) `DO2`, o isolamento multi-tenant e a atenuação de privilégio
da filosofia §7. **Detalha** o critério *isolamento* de [`context-assembly`](context-assembly.spec.md)
e a operação *isolate* de [`context-lifecycle`](context-lifecycle.spec.md).

---

## 2. Problema que resolve

Contexto sem isolamento vaza entre papéis, subagentes e tenants, e degrada a decisão por quatro modos
de falha conhecidos. Dar a um subagente o contexto inteiro amplia o privilégio e a superfície de risco;
recuperar RAG/memória sem escopo permite que dado de um tenant/autoridade governe outro.

Esta spec elimina o risco fixando o isolamento como **invariante de segurança**: escopo explícito,
atenuação de privilégio, e bloqueio determinístico de qualquer travessia de fronteira.

---

## 3. Autoridade envolvida

- **Garante o isolamento:** a camada de Contexto/Retrieval sob policies, com o **Estado** como verdade,
  **Specifications/Policies** como Authority e o `tenant-boundary` como invariante.
- **Coordena (não decide atravessar):** o **Runtime** pode coordenar o isolamento, mas **NÃO decide
  atravessar fronteira** — não autoriza vazamento.
- **NÃO podem solicitar nem justificar vazamento:** **LLM, agente e prompt** não pedem, não justificam
  e não recebem contexto fora do seu escopo (`P1`, `DO2`).

---

## 4. Entradas esperadas

- O **pacote de contexto** montado ([`context-assembly`](context-assembly.spec.md)) e seu ciclo de vida
  ([`context-lifecycle`](context-lifecycle.spec.md)), com fonte, proveniência e tenant por fragmento.
- O **escopo declarado** da operação/subagente (papel, tenant, autoridade, finalidade).
- As **policies de isolamento** aplicáveis e o invariante de [`tenant-boundary`](../p0/tenant-boundary.spec.md).

## 5. Saídas esperadas

- Um contexto **escopado e atenuado**: cada operação/subagente recebe apenas o necessário, sem
  contaminação cruzada.
- O **registro auditável** de cada decisão de isolamento e de **toda quebra ou tentativa de quebra**
  (evidência), preservando a auditoria posterior.

---

## 6. Contrato esperado (linguagem natural)

1. Todo contexto **DEVE** ter **escopo explícito** (papel, tenant, autoridade, finalidade); contexto
   sem escopo claro **NÃO DEVE** governar decisão.
2. O contexto de um **subagente DEVE ser limitado por atenuação de privilégio**: apenas o estritamente
   necessário, nunca o contexto total.
3. O isolamento de contexto **é mecanismo de segurança, governança e controle operacional** — não
   conveniência — e **DEVE** impedir **poisoning, distraction, confusion e clash** (§7).
4. **Contexto recuperado por RAG DEVE respeitar tenant scope e authority layer**.
5. **Memória recuperada DEVE respeitar tenant scope, provenance e policy** ([`memory-model`](../p1/memory-model.spec.md)).
6. Contexto **sem escopo claro** **DEVE** ser **bloqueado, isolado, descartado ou escalado** — nunca
   admitido por padrão.
7. O **Runtime** pode coordenar o isolamento, mas **NÃO decide atravessar fronteira**.
8. **LLM, agente ou prompt NÃO PODEM solicitar nem justificar vazamento de contexto**.
9. **Nenhum ganho de conveniência, fluidez conversacional ou personalização** **DEVE** justificar
   quebra de isolamento.
10. **Toda quebra ou tentativa de quebra de isolamento DEVE gerar evidência auditável**; o isolamento
    **DEVE preservar a possibilidade de auditoria posterior**.

---

## 7. Os quatro modos de falha de contexto que o isolamento previne

| Modo de falha | O que é | Como o isolamento previne |
| --- | --- | --- |
| **Poisoning** | informação falsa/errada entra no contexto e passa a ser referenciada | escopo + proveniência barram fragmento sem origem válida |
| **Distraction** | contexto cresce a ponto de desviar a decisão do essencial | atenuação de privilégio entrega o mínimo necessário |
| **Confusion** | conteúdo supérfluo/irrelevante influencia a resposta | seleção escopada exclui o que não serve à operação |
| **Clash** | partes do contexto se contradizem entre si | isolamento por papel/tenant evita misturar fontes conflitantes |

A prevenção desses quatro modos é **propriedade do isolamento**, não do prompt nem do modelo.

---

## 8. Atenuação de privilégio (contexto de subagentes)

1. Um subagente recebe um **contexto atenuado**: estritamente o necessário ao seu papel e à sua
   finalidade — **nunca** o contexto integral do sistema, do operador ou de outro tenant.
2. A atenuação é **decrescente e não-restaurável** dentro da cadeia: um subagente não amplia o próprio
   escopo nem concede a outro mais privilégio do que recebeu.
3. O escopo de cada subagente é **explícito e verificável**; contexto sem escopo declarado é tratado
   por §6.6 (bloqueado/isolado/descartado/escalado).

---

## 9. Isolamento de retrieval e de memória

1. **RAG / retrieval:** todo contexto recuperado **respeita tenant scope e authority layer** — nenhum
   fragmento de outro tenant ou de autoridade indevida entra no pacote.
2. **Memória:** toda memória recuperada **respeita tenant scope, provenance e policy**; memória sem
   proveniência ou fora de política não governa decisão ([`memory-model`](../p1/memory-model.spec.md)).
3. Em dúvida sobre escopo, tenant ou autoridade de um fragmento recuperado, a operação **bloqueia,
   isola, descarta ou escala** — nunca admite por padrão.

---

## 10. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Atribuir **escopo explícito** a todo contexto e recusar contexto sem escopo claro.
2. Aplicar **atenuação de privilégio** ao contexto de subagentes (§8).
3. Prevenir **poisoning, distraction, confusion e clash** (§7).
4. Garantir que RAG respeite **tenant scope e authority layer**, e que memória respeite **tenant scope,
   provenance e policy** (§9).
5. Tratar contexto sem escopo por **bloqueio/isolamento/descarte/escalada** (§6.6).
6. Manter o **Runtime** como coordenador que **não atravessa fronteira**; impedir LLM/agente/prompt de
   **solicitar ou justificar** vazamento.
7. Recusar qualquer justificativa de **conveniência, fluidez ou personalização** para quebrar
   isolamento.
8. Gerar **evidência auditável** de toda quebra/tentativa e **preservar auditoria posterior** (`P9`,
   `DO6`).

---

## 11. Critérios de aceite

1. Referencia `DO2`, o isolamento multi-tenant e a atenuação de privilégio sem contradizê-los nem
   duplicá-los.
2. Fixa escopo explícito + atenuação de privilégio para subagentes (§6, §8).
3. Fixa o isolamento como mecanismo de segurança/governança/controle que previne poisoning/distraction/
   confusion/clash (§7).
4. Fixa RAG sob tenant scope + authority layer e memória sob tenant scope/provenance/policy (§9).
5. Fixa o tratamento de contexto sem escopo e a proibição de vazamento por conveniência.
6. Exige evidência auditável de quebras/tentativas e preservação da auditoria; revisável por humano.

---

## 12. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Admite contexto sem escopo claro governando decisão.
2. Entrega a um subagente contexto não atenuado (privilégio total).
3. Não previne poisoning/distraction/confusion/clash.
4. Permite RAG/memória fora de tenant scope, authority layer, provenance ou policy.
5. Deixa o runtime, o LLM, o agente ou o prompt atravessar/solicitar/justificar travessia de fronteira.
6. Aceita conveniência/fluidez/personalização como justificativa para quebra de isolamento.
7. Não gera evidência de quebra/tentativa, ou impede a auditoria posterior.
8. Introduz código/API/schema/YAML/JSON/contrato machine-readable; ou reposiciona o YZI OS.

---

## 13. Relação com as camadas do YZI OS

O isolamento de contexto serve a camada de **Contexto/Retrieval** como **face contextual da
governança** e como **mecanismo de segurança**: o Estado é a verdade, as Policies/Specifications são
Authority, e o `tenant-boundary` é o invariante que o isolamento nunca cruza. O `context-harness`
administra o isolamento; o `retrieval-harness` o aplica no RAG; o `observability/audit` registra
quebras e tentativas. Herda autoridade de
[`layer-authority-model`](../p0/layer-authority-model.spec.md) e isolamento de
[`tenant-boundary`](../p0/tenant-boundary.spec.md) e [`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md).

---

## 14. Relação com specifications futuras

Integra o grupo Context/Retrieval: detalha o *isolamento* de [`context-assembly`](context-assembly.spec.md)
e o *isolate* de [`context-lifecycle`](context-lifecycle.spec.md); antecede `context-provenance`
(proveniência em detalhe), `retrieval-governance` (recuperação governada) e o grupo Multi-Tenant
(`tenant-retrieval-scope`) — ver [Specification Map](../../specification-engineering/specification-map.md).
É parte do `context-harness` e base do contexto atenuado dos subagentes.

---

## 15. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Relação com o isolamento de contexto |
| --- | --- |
| **Skill** | recebe contexto escopado; não amplia o próprio escopo |
| **Subagente** | opera com **contexto atenuado** (§8); nunca herda o contexto integral |
| **Harness** | o `context-harness`/`retrieval-harness` aplica o isolamento; o `audit` registra quebras |
| **Service** | compõe e escopa o contexto sob policy; não atravessa fronteira |
| **Tool** | fornece fragmentos com tenant e proveniência; não recebe contexto fora do seu escopo |
| **LLM / agente de código** | não solicita nem justifica vazamento; sua instrução é Metadata |

---

## 16. Método de verificação

1. **Escopo:** verificar que todo contexto tem escopo explícito e que contexto sem escopo é
   bloqueado/isolado/descartado/escalado.
2. **Atenuação:** verificar que subagentes recebem o mínimo necessário, nunca o contexto integral.
3. **Modos de falha:** verificar prevenção de poisoning/distraction/confusion/clash (§7).
4. **Retrieval/memória:** verificar tenant scope + authority layer (RAG) e tenant scope/provenance/
   policy (memória).
5. **Vazamento:** tentar atravessar fronteira por conveniência/fluidez/personalização ⇒ deve ser
   barrado e **gerar evidência**.
6. Violação ⇒ rejeição/escalada; verificação independente do agente e reconstruível.

---

## 17. Observabilidade esperada

- Registro, por operação: escopo aplicado · tenant · authority layer · decisão de isolamento.
- Registro de **toda quebra e tentativa de quebra** de isolamento (evidência auditável), com causa.
- Registro de fragmentos barrados (cross-tenant, sem escopo, sem proveniência, autoridade indevida).
- Trilha auditável e read-only que **preserva a auditoria posterior** (`P9`, `DO6`).

---

## 18. Riscos arquiteturais evitados

- **Vazamento entre papéis/tenants** — contexto cruzando fronteira (`DO2`, `tenant-boundary`).
- **Privilégio não atenuado** — subagente com contexto integral ampliando a superfície de risco.
- **Poisoning / distraction / confusion / clash** — os quatro modos de falha de contexto (§7).
- **RAG/memória fora de escopo** — recuperação ignorando tenant/authority/provenance/policy.
- **Quebra por conveniência** — fluidez/personalização justificando vazamento.
- **Quebra sem rastro** — isolamento rompido sem evidência, perdendo auditoria posterior.

---

## 19. Fora de escopo

- **Não** redefine a **montagem** (`context-assembly`), o **ciclo de vida** (`context-lifecycle`), a
  **proveniência** em detalhe (`context-provenance`) nem o **retrieval governado**
  (`retrieval-governance`) — apenas o **isolamento** e os referencia.
- **Não** cria o `context-harness` executável nem nenhuma outra spec.
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  sprint plan, YAML/JSON, contrato machine-readable ou implementation harness.

---

## 20. Proveniência

`[CE]` Context Engineering — isolamento de contexto; os quatro modos de falha (poisoning, distraction,
confusion, clash); proveniência e escopo. `[PYR]` Context→Intent→Specification — isolamento de
visibilidade; contexto como ambiente governado. `[AHE]` Agentic Harness Engineering — atenuação de
privilégio; contexto atenuado de subagentes; isolamento como mecanismo de segurança e controle.

---

## 21. Fronteiras (o que NÃO está aqui)

- **Não** substitui `DO2` nem o isolamento multi-tenant: é a spec que os **opera** como contrato de
  isolamento de contexto verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura — apenas fixa o isolamento de contexto que as demais herdam.
