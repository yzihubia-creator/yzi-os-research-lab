# YZI OS — Mapa de Skills

> **Documento de arquitetura (ponte), architecture-only.** Mapeia, classifica e estrutura quais
> **capacidades** podem virar **skills** em fases futuras do YZI OS. **Não** cria skills
> executáveis, prompts, configurações, código, APIs, schemas ou implementation harness. A
> arquitetura continua sendo o produto.
>
> Par deste documento: [Mapa de Subagentes](../subagents/subagent-map.md). Skills e subagentes
> são **domínios distintos** — capacidades vs. papéis — mantidos separados por desenho.
>
> Camada: `skills` · Status: canônico · Versão: v1 · Data: 2026-06-03
> Proveniência: `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]` (ver
> [`terminology.md`](../foundation/terminology.md))

---

## 1. Propósito

Este mapa responde: **quais capacidades reutilizáveis (skills) o YZI OS deverá ter, e como cada
uma deriva das specifications já mapeadas?** É a ponte entre o
[Specification Map](../specification-engineering/specification-map.md) e a futura criação
controlada de skills — sem executá-la.

---

## 2. Definição obrigatória — Skill

Uma **skill** é uma **capacidade modular reutilizável, governada por specification, com
entradas, saídas, limites, critérios de sucesso e observabilidade esperada.**

Uma skill **NÃO é**: prompt gigante · persona · comportamento solto · automação improvisada ·
instrução textual sem contrato.

> Invariante: uma skill **não detém autoridade comportamental**. Os services decidem, as tools
> executam, o estado é a verdade. A skill **propõe/transforma dentro de fronteiras**.
> (`P1` `P2` `P14` `P18`)

---

## 3. Relação com o Specification Map e o PRD

Skills **derivam de specifications** — não as substituem. A origem está na coluna de candidatura
do [Specification Map §11](../specification-engineering/specification-map.md): specs marcadas
`skill` são candidatas a skill. Specs `harness`/`service-tool`/`gov-doc` **não** viram skill
nesta fase. O [PRD §12/§14](../prd/yzi-os-prd-v1.md) sustenta o contexto como OS do agente — a
maioria das skills iniciais é, por isso, de **contexto**.

---

## 4. Relação com Spec-Driven Development

> PRD → Specification Map → **[ESTE + Mapa de Subagentes]** → (futuro) specs executáveis →
> criação controlada de skills/subagentes → harnesses → plano → código.

Este mapa **orienta** a futura criação de skills; não a executa.

---

## 5. Critérios de promoção a skill

Uma capacidade é promovida a skill quando, e somente quando:
1. é **modular e reutilizável** em mais de um contexto/papel;
2. é **governada por uma specification** (contrato verificável) — sem spec, não há skill (`P15`, `DO4`);
3. tem **entradas, saídas e limites** explícitos;
4. tem **critério de sucesso** verificável e **observabilidade esperada** declarada (`P8`);
5. **não decide nem executa autonomamente** — propõe/transforma dentro de fronteiras (`P2` `P14`);
6. trata memória como **ambiente** (estado), não como campo interno (`P17`).

---

## 6. Taxonomia de skills

| Grupo | Foco | Skills |
| --- | --- | --- |
| **S-A. Contexto** | montar/curar/proveniência do pacote de contexto | `context-assembly`, `context-curation`, `provenance-tagging` |
| **S-B. Recuperação** | formular recuperação governada | `retrieval-query` |
| **S-C. Linguagem/Intenção** | extrair intenção e sintetizar sinal | `intent-extraction`, `synthesis` |
| **S-D. Verificação/Evidência** | compor evidência e diagnosticar falha | `evidence-compilation`, `failure-diagnosis` |
| **S-E. Fronteira** | avaliar fronteira e disparar escalada | `escalation-trigger` |

**9 skills futuras** em 5 grupos.

---

## 7. Skills mapeadas

> Campos: **Capacidade · Specs governantes · Camada · Entradas → Saídas · Limites · Critério de
> sucesso · Observabilidade · Tenant-scope · Proveniência.**

### S-A. Contexto

#### `context-assembly`
- **Capacidade:** montar o pacote de contexto com papéis e prioridade (Authority › Exemplar › Constraint › Rubric › Metadata).
- **Specs:** `context-assembly`, `context-lifecycle` · **Camada:** context-engineering
- **Entradas → Saídas:** estado + corpus recuperado → pacote de contexto montado.
- **Limites:** não decide; não executa; respeita os cinco critérios (relevância, suficiência, isolamento, economia, proveniência).
- **Critério de sucesso:** pacote satisfaz os cinco critérios; Authority sobrepõe Metadata.
- **Observabilidade:** trace de composição (o que entrou, de onde, por quê). **Tenant-scope:** per-tenant. **Proveniência:** `[PYR]` `[CE]`

#### `context-curation`
- **Capacidade:** operar write/select/compress/isolate sobre o contexto.
- **Specs:** `context-lifecycle` · **Camada:** context-engineering
- **Entradas → Saídas:** contexto bruto → contexto curado dentro do tempo de vida.
- **Limites:** não cria conteúdo novo; só seleciona/comprime/isola.
- **Critério de sucesso:** economia sem perda de suficiência; descarte governado.
- **Observabilidade:** registro de seleção/descarte. **Tenant-scope:** per-tenant. **Proveniência:** `[PYR]`

#### `provenance-tagging`
- **Capacidade:** anexar origem, momento e confiança a cada fragmento.
- **Specs:** `context-provenance` · **Camada:** context-engineering
- **Entradas → Saídas:** fragmento → fragmento com proveniência.
- **Limites:** não altera o conteúdo do fragmento.
- **Critério de sucesso:** 100% dos fragmentos com proveniência auditável.
- **Observabilidade:** proveniência é, ela própria, observável. **Tenant-scope:** per-tenant. **Proveniência:** `[CE]` `[PYR]`

### S-B. Recuperação

#### `retrieval-query`
- **Capacidade:** formular recuperação governada dentro de política e escopo de tenant.
- **Specs:** `retrieval-governance`, `tenant-retrieval-scope` · **Camada:** context-engineering
- **Entradas → Saídas:** intenção + política → consulta de recuperação governada.
- **Limites:** não recupera fora da política nem do escopo do tenant.
- **Critério de sucesso:** nenhuma recuperação ad hoc; cada resultado rastreável à política.
- **Observabilidade:** trace de consulta e política aplicada. **Tenant-scope:** per-tenant. **Proveniência:** `[PYR]`

### S-C. Linguagem/Intenção

#### `intent-extraction`
- **Capacidade:** extrair a intenção institucional da entrada e produzir proposta estruturada (Metadata).
- **Specs:** `institutional-agent`, `behavioral-governance` · **Camada:** agents/governance
- **Entradas → Saídas:** entrada linguística → operação proposta (prioridade mínima).
- **Limites:** não decide; a proposta entra como Metadata.
- **Critério de sucesso:** proposta fiel à intenção, sem assumir autoridade.
- **Observabilidade:** trace intenção→proposta. **Tenant-scope:** global/inst. **Proveniência:** `[PYR]` `[CE]`

#### `synthesis`
- **Capacidade:** sintetizar sinal de múltiplas fontes em representação para **suporte** à decisão.
- **Specs:** `context-assembly`, `service-contract` · **Camada:** context/services
- **Entradas → Saídas:** múltiplas fontes de sinal → síntese para decisão dos services.
- **Limites:** **suporta**, não decide; a decisão é dos services.
- **Critério de sucesso:** síntese suficiente e rastreável; nenhuma decisão embutida.
- **Observabilidade:** proveniência das fontes sintetizadas. **Tenant-scope:** per-tenant. **Proveniência:** `[PYR]`

### S-D. Verificação/Evidência

#### `evidence-compilation`
- **Capacidade:** mapear requisitos a verificações determinísticas e compor o objeto evidenciário.
- **Specs:** `verification-report`, `tool-result-verification` · **Camada:** observability
- **Entradas → Saídas:** requisitos + resultado → relatório de evidência.
- **Limites:** não conclui por asserção; conclusão = evidência.
- **Critério de sucesso:** todo requisito mapeado a uma verificação; limitações reportadas.
- **Observabilidade:** o relatório é o artefato observável. **Tenant-scope:** global/inst. **Proveniência:** `[HARNESS-RT]`

#### `failure-diagnosis`
- **Capacidade:** reproduzir e **atribuir** a falha antes de qualquer correção.
- **Specs:** `failure-attribution` · **Camada:** observability
- **Entradas → Saídas:** episódio com falha → atribuição de causa.
- **Limites:** diagnóstico separado da ação corretiva (evita remendos).
- **Critério de sucesso:** atribuição precede correção; causa reconstruível.
- **Observabilidade:** atribuição registrada no episódio. **Tenant-scope:** global/inst. **Proveniência:** `[HARNESS-RT]`

### S-E. Fronteira

#### `escalation-trigger`
- **Capacidade:** avaliar a fronteira de decisão e disparar escalada ao operador.
- **Specs:** `escalation-policy`, `operational-boundaries` · **Camada:** governance
- **Entradas → Saídas:** operação + fronteira → decisão de escalar (ou não).
- **Limites:** não resolve a operação fora da fronteira; escala.
- **Critério de sucesso:** toda operação fora de fronteira gera escalada registrada.
- **Observabilidade:** evento de escalada auditável. **Tenant-scope:** global/inst. **Proveniência:** `[PYR]` `[HE-GOV]`

---

## 8. Conjunto mínimo inicial de skills (recomendado)

Para o **primeiro ciclo governado** ponta a ponta:

1. **`intent-extraction`** — sem extrair intenção, não há proposta.
2. **`context-assembly`** — sem pacote de contexto, não há operação informada.
3. **`provenance-tagging`** — sem proveniência, não há auditabilidade desde o início (`P9`).
4. **`evidence-compilation`** — sem evidência, a conclusão vira asserção (`DO9`).

As demais (curation, retrieval-query, synthesis, failure-diagnosis, escalation-trigger) entram
conforme as ondas de specs correspondentes estabilizam.

---

## 9. Skills que NÃO devem existir agora

- Skills que **decidem** ou **executam** autonomamente (violam `P2` `P14`).
- Skills-persona, "prompt gigante", comportamento solto, automação improvisada, instrução
  textual sem contrato (contrariam a definição da §2).
- Skills que **acessam estado/tools** diretamente sem passar pela fronteira de permissão.
- Skills de implementação (parsing de schema, chamadas de API, I/O concreto).

---

## 10. Riscos arquiteturais (domínio skills)

| Risco | Origem | Mitigação |
| --- | --- | --- |
| Skill virar prompt gigante/persona | diluição da definição | definição §2 + critérios §5 |
| Skill sem contrato (specification debt) | criar antes de especificar | promoção exige spec governante (`P15` `DO4`) |
| Skill que decide/executa | colapso linguagem↔operação | §2, §9; sem autoridade comportamental |
| Skill acessando estado/tools direto | bypass de fronteira | só via permissão (`P14`) |
| Vazamento entre tenants | escopo mal definido | tenant-scope em cada card |

---

## 11. Matriz: skill → specs → camada → entrada/saída → sucesso → observabilidade

| Skill | Specs | Camada | Entrada → Saída | Sucesso | Observabilidade |
| --- | --- | --- | --- | --- | --- |
| context-assembly | context-assembly, context-lifecycle | context-eng | estado+corpus → pacote | 5 critérios; Authority>Metadata | trace de composição |
| context-curation | context-lifecycle | context-eng | contexto → contexto curado | economia sem perda | registro select/descarte |
| provenance-tagging | context-provenance | context-eng | fragmento → c/ proveniência | 100% com proveniência | proveniência observável |
| retrieval-query | retrieval-governance, tenant-retrieval-scope | context-eng | intenção+política → consulta | sem ad hoc | trace de consulta |
| intent-extraction | institutional-agent, behavioral-governance | agents/gov | entrada → proposta | fiel; não decide | trace intenção→proposta |
| synthesis | context-assembly, service-contract | context/services | sinais → síntese | sem decisão embutida | proveniência das fontes |
| evidence-compilation | verification-report, tool-result-verification | observability | requisitos+resultado → evidência | requisito↔verificação | relatório de evidência |
| failure-diagnosis | failure-attribution | observability | episódio → atribuição | atribuição precede correção | atribuição no episódio |
| escalation-trigger | escalation-policy, operational-boundaries | governance | operação+fronteira → escalar? | toda fronteira → escalada | evento de escalada |

---

## 12. Relação com subagentes

**Subagentes compõem skills.** Uma skill é reutilizável por vários subagentes; um subagente é o
**papel** que orquestra skills sob sua specification e fronteira. A composição (usar uma
capacidade) difere da delegação (transferir autoridade com **atenuação de privilégio**). O
mapeamento de quais subagentes compõem quais skills está no
[Mapa de Subagentes](../subagents/subagent-map.md).

---

## 13. Fora de escopo

Esta fase **não** produz: skills executáveis · prompts de skills · código · APIs · schemas ·
frontend · backlog · implementation harness · contratos machine-readable · YAML/JSON. Continua
**architecture-only**.

---

## 14. Próximo checkpoint recomendado

Recomendação (sem iniciar): **estabilizar primeiro as specs governantes** das skills mínimas
(Specification Map, ondas P0–P2) antes de criar qualquer skill. Quando autorizado, criar **uma
skill por vez**, na ordem do conjunto mínimo (§8), com checkpoint por item.

---

## Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P15`/`DO4` specifications governam | promoção exige spec (§5) |
| `P2`/`P14` sem autoridade | skills propõem/transformam (§2, §9) |
| `P8`/`P9` observabilidade | observabilidade esperada por skill (§7, §11) |
| `P10` multi-tenant | tenant-scope por skill (§7) |
| `P17` memória é ambiente | critério de promoção (§5) |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md), nunca a numeração.

## Fronteiras (o que NÃO está aqui)

- **Não** cria skills executáveis, prompts ou configurações — ver §9, §13.
- **Não** define papéis (subagentes) — ver [subagent-map](../subagents/subagent-map.md).
- **Não** substitui as specs governantes — é o mapa que orienta a futura promoção a skill.
