# YZI OS — Mapa de Subagentes

> **Documento de arquitetura (ponte), architecture-only.** Mapeia, classifica e estrutura quais
> **responsabilidades** podem virar **subagentes** em fases futuras do YZI OS. **Não** cria
> subagentes executáveis, configurações, código, APIs, schemas ou implementation harness. A
> arquitetura continua sendo o produto.
>
> Par deste documento: [Mapa de Skills](../skills/skill-map.md). Skills e subagentes são
> **domínios distintos** — capacidades vs. papéis — mantidos separados por desenho.
>
> Camada: `subagents` · Status: canônico · Versão: v1 · Data: 2026-06-03
> Proveniência: `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]` (ver
> [`terminology.md`](../foundation/terminology.md))

---

## 1. Propósito

Este mapa responde: **quais papéis operacionais especializados (subagentes) o YZI OS deverá ter,
e como cada um deriva das specifications já mapeadas?** É a ponte entre o
[Specification Map](../specification-engineering/specification-map.md) e a futura criação
controlada de subagentes — sem executá-la.

---

## 2. Definição obrigatória — Subagente

Um **subagente** é um **papel operacional especializado, governado por specification, com
autoridade limitada, escopo claro, permissões explícitas e método de verificação.**

Um subagente **NÃO é**: chatbot · personagem · persona · decisor autônomo · automação
improvisada.

> Invariante: um subagente **não detém autoridade comportamental**. Os services decidem, as
> tools executam, o estado é a verdade, a governança restringe. O subagente **propõe e opera
> dentro de fronteiras**. (`P1` `P2` `P7` `P14` `P18`)

---

## 3. Relação com o Specification Map e o PRD

Subagentes **derivam de specifications** — não as substituem. A origem está na coluna de
candidatura do [Specification Map §11](../specification-engineering/specification-map.md): specs
marcadas `subagente` são candidatas a subagente. O [PRD §12](../prd/yzi-os-prd-v1.md) define o
agente como interface linguística institucional; este mapa decompõe essa interface em **papéis**
que **compõem capacidades (skills)**, todos governados por specification.

---

## 4. Relação com Spec-Driven Development

> PRD → Specification Map → **[Mapa de Skills + ESTE]** → (futuro) specs executáveis → criação
> controlada de skills/subagentes → harnesses → plano → código.

Este mapa **orienta** a futura criação de subagentes; não a executa.

---

## 5. Critérios de promoção a subagente

Uma responsabilidade é promovida a subagente quando, e somente quando:
1. é um **papel operacional especializado** e nomeável;
2. é **governada por specification** com **autoridade limitada** e **escopo claro**;
3. tem **permissões explícitas** e respeita **atenuação de privilégio** na delegação (`[PYR]`);
4. tem **método de verificação** e **fronteira de decisão/escalação** definidos;
5. **nunca** detém autoridade comportamental nem decide no lugar dos services (`P2` `P7`);
6. respeita o **isolamento por tenant** (`P10`) e a **independência do auditor** quando aplicável (`[CE]`).

---

## 6. Taxonomia de subagentes

| Grupo | Papel | Subagente |
| --- | --- | --- |
| **Sub-A. Interface** | interface linguística institucional | `interface-subagent` |
| **Sub-B. Recuperação** | recuperação governada por tenant | `retrieval-subagent` |
| **Sub-C. Execução** | proposta de invocação sob permissão | `execution-proposal-subagent` |
| **Sub-D. Verificação** | auditor independente de conclusões | `verification-subagent` |
| **Sub-E. Fronteira** | escalada e intervenção humana | `escalation-subagent` |
| **Sub-F. Síntese** | síntese de sinal para suporte à decisão | `synthesis-subagent` |

**6 subagentes futuros** em 6 grupos.

---

## 7. Subagentes mapeados

> Campos: **Papel · Specs governantes · Camada · Autoridade (limitada) · Escopo · Permissões ·
> Verificação · Fronteira/escalação · Delegação (atenuação) · Tenant-scope · Proveniência ·
> Skills que compõe.**

#### `interface-subagent` (Agente Institucional)
- **Papel:** interface linguística; traduz intenção em operação proposta.
- **Specs:** `institutional-agent`, `agent-execution`, `agent-governance` · **Camada:** agents
- **Autoridade:** propor (Metadata); **nunca** decidir/executar. **Escopo:** linguagem ↔ proposta.
- **Permissões:** ler contexto montado; emitir proposta. **Verificação:** proposta passa por enforcement pré.
- **Fronteira/escalação:** fora de competência → `escalation-subagent`. **Delegação:** delega a sub-papéis com privilégio estreitado.
- **Tenant-scope:** global/inst. **Proveniência:** `[PYR]` `[CE]` · **Compõe:** `intent-extraction`, `context-assembly`.

#### `retrieval-subagent`
- **Papel:** recuperar contexto governado dentro do escopo do tenant.
- **Specs:** `retrieval-governance`, `tenant-retrieval-scope`, `context-assembly` · **Camada:** context-engineering
- **Autoridade:** recuperação read-only por política. **Escopo:** corpus e visibilidade do tenant.
- **Permissões:** leitura do corpus do tenant. **Verificação:** proveniência por fragmento; nada fora da política.
- **Fronteira/escalação:** recuperação ambígua/insuficiente → reporta, não inventa. **Delegação:** não delega execução.
- **Tenant-scope:** per-tenant. **Proveniência:** `[PYR]` · **Compõe:** `retrieval-query`, `provenance-tagging`, `context-curation`.

#### `execution-proposal-subagent`
- **Papel:** propor invocações de tool dentro da fronteira de permissão.
- **Specs:** `tool-execution`, `tool-permission`, `runtime-permission-boundaries` · **Camada:** tools/runtime
- **Autoridade:** **propor** execução; **nunca** conceder a própria permissão. **Escopo:** tools registradas permitidas.
- **Permissões:** explícitas por tool e tenant; atenuadas na delegação. **Verificação:** runtime valida permissão antes de executar.
- **Fronteira/escalação:** sem permissão → bloqueio + auditoria. **Delegação:** privilégio só decresce.
- **Tenant-scope:** global/inst. **Proveniência:** `[HARNESS-RT]` `[PYR]` · **Compõe:** (consome tools; não decide).

#### `verification-subagent` (Auditor independente)
- **Papel:** verificar conclusões de forma **independente de quem executou**.
- **Specs:** `verification-report`, `failure-attribution`, `tool-result-verification` · **Camada:** observability
- **Autoridade:** emitir veredito de verificação; **read-only** sobre verificador/tracer/config. **Escopo:** evidência de episódios.
- **Permissões:** leitura de traces e evidência; **não** executa nem corrige. **Verificação:** independência — não pode ser o executor.
- **Fronteira/escalação:** falha não atribuível → escala. **Delegação:** não delega execução.
- **Tenant-scope:** global/inst. **Proveniência:** `[HARNESS-RT]` `[CE]` · **Compõe:** `evidence-compilation`, `failure-diagnosis`.

#### `escalation-subagent`
- **Papel:** detectar excesso de fronteira, rotear ao operador humano, registrar intervenção.
- **Specs:** `escalation-policy`, `intervention-log`, `operational-boundaries` · **Camada:** governance
- **Autoridade:** acionar escalada; registrar intervenção. **Escopo:** fronteiras de decisão.
- **Permissões:** abrir escalada; gravar log de intervenção. **Verificação:** toda fronteira excedida gera escalada.
- **Fronteira/escalação:** é o próprio ponto de escalada. **Delegação:** preserva responsabilidade do operador.
- **Tenant-scope:** global/inst. **Proveniência:** `[PYR]` `[HE-GOV]` · **Compõe:** `escalation-trigger`.

#### `synthesis-subagent`
- **Papel:** sintetizar sinal institucional para **suportar** a decisão dos services.
- **Specs:** `context-assembly`, `behavioral-governance`, `service-contract` · **Camada:** context/services
- **Autoridade:** produzir síntese; **não** decide. **Escopo:** fontes de sinal do tenant.
- **Permissões:** leitura de fontes recuperadas. **Verificação:** síntese rastreável às fontes; nenhuma decisão embutida.
- **Fronteira/escalação:** decisão pertence aos services. **Delegação:** privilégio estreitado.
- **Tenant-scope:** per-tenant. **Proveniência:** `[PYR]` · **Compõe:** `synthesis`, `context-assembly`.

---

## 8. Conjunto mínimo inicial de subagentes (recomendado)

Para um primeiro ciclo governado **auditável**:

1. **`interface-subagent`** — recebe intenção e propõe.
2. **`retrieval-subagent`** — monta o mundo informacional governado.
3. **`verification-subagent`** — garante a **independência do auditor** desde o início (`[CE]`).

`execution-proposal-subagent`, `escalation-subagent` e `synthesis-subagent` entram quando as
specs de execução, escalação e síntese estabilizam (ondas P3–P4 do Specification Map).

---

## 9. Relação entre subagentes e skills

- **Subagentes compõem skills.** Cada subagente orquestra skills (coluna "Compõe" em §7) sob a
  sua specification e fronteira; a mesma skill é reutilizável por vários subagentes.
- **Delegação ≠ composição.** Compor é usar uma capacidade; delegar é transferir autoridade e
  responsabilidade a outro papel — sempre com **atenuação de privilégio**. `[PYR]`
- **Nenhum subagente governa.** Operam dentro do ciclo governado; governança é das policies/specs,
  decisão dos services, execução das tools, verdade do estado.

O catálogo de skills está no [Mapa de Skills](../skills/skill-map.md).

---

## 10. Subagentes que NÃO devem existir agora

- Subagente **chatbot/persona/personagem** ou **decisor autônomo** (contrariam a definição da §2).
- Subagente **coordenador com autoridade** (a coordenação é do runtime leve, sem autoridade
  comportamental — `P6` `P13`).
- Subagente **supervisor que pode desligar a própria fiscalização** (viola o invariante de
  controlabilidade — `[AHE]`).
- Subagente **executor que também audita** (viola a independência do auditor — `[CE]`).
- Subagente **auto-modificador** ou com privilégio que **cresce** na delegação (viola atenuação
  de privilégio — `[PYR]`).

---

## 11. Riscos arquiteturais (domínio subagentes)

| Risco | Origem | Mitigação |
| --- | --- | --- |
| Subagente virar chatbot/decisor autônomo | colapso linguagem↔operação | §2, §10; sem autoridade comportamental |
| Escalonamento de privilégio na delegação | delegação sem atenuação | §5, §9; privilégio só decresce |
| Auditor que também executa | falta de independência | `verification-subagent` read-only, ≠ executor |
| Monólito distribuído com ilusão de independência | decompor confundido com delegar | §9 delegação ≠ composição |
| Coordenador com autoridade | runtime virando agente | coordenação é runtime leve (`P6` `P13`) |
| Subagente sem contrato (specification debt) | criar antes de especificar | promoção exige spec (`P15` `DO4`) |
| Vazamento entre tenants | escopo mal definido | tenant-scope por subagente (§7) |

---

## 12. Matriz: subagente → papel → specs → autoridade/fronteira → permissões → tenant-scope → verificação

| Subagente | Papel | Specs | Autoridade / fronteira | Permissões | Tenant-scope | Verificação |
| --- | --- | --- | --- | --- | --- | --- |
| interface-subagent | interface linguística | institutional-agent, agent-execution, agent-governance | propor; não decide | ler contexto; emitir proposta | global/inst | enforcement pré |
| retrieval-subagent | recuperação governada | retrieval-governance, tenant-retrieval-scope | read-only por política | ler corpus do tenant | per-tenant | proveniência por fragmento |
| execution-proposal-subagent | proposta de execução | tool-execution, tool-permission, runtime-permission-boundaries | propor; não autoconcede permissão | tools permitidas | global/inst | permissão validada pelo runtime |
| verification-subagent | auditor independente | verification-report, failure-attribution | veredito; read-only sobre fiscalização | ler traces/evidência | global/inst | independência (≠ executor) |
| escalation-subagent | escalada/intervenção | escalation-policy, intervention-log, operational-boundaries | acionar escalada | abrir escalada; logar intervenção | global/inst | fronteira excedida → escalada |
| synthesis-subagent | síntese de suporte | context-assembly, behavioral-governance, service-contract | sintetizar; não decide | ler fontes recuperadas | per-tenant | síntese rastreável; sem decisão |

---

## 13. Fora de escopo

Esta fase **não** produz: subagentes executáveis · configuração de subagentes · código · APIs ·
schemas · frontend · backlog · implementation harness · contratos machine-readable · YAML/JSON.
Continua **architecture-only**.

---

## 14. Próximo checkpoint recomendado

Recomendação (sem iniciar): **estabilizar primeiro as specs governantes** dos subagentes mínimos
(Specification Map, ondas P0–P3) antes de criar qualquer subagente. Quando autorizado, criar
**um subagente por vez**, na ordem do conjunto mínimo (§8), com checkpoint por item.

---

## Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P7` agentes são interfaces | subagentes propõem, não decidem (§2, §7) |
| `P2`/`P14` backend decide / tools executam | sem autoridade comportamental (§2, §10) |
| `P15`/`DO4` specifications governam | promoção exige spec (§5) |
| `P10` multi-tenant | tenant-scope por subagente (§7) |
| `[PYR]` atenuação de privilégio | delegação só estreita (§5, §9, §10) |
| `[CE]` independência do auditor | `verification-subagent` ≠ executor (§7, §10) |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md), nunca a numeração.

## Fronteiras (o que NÃO está aqui)

- **Não** cria subagentes executáveis ou configurações — ver §10, §13.
- **Não** define capacidades (skills) — ver [skill-map](../skills/skill-map.md).
- **Não** substitui as specs governantes — é o mapa que orienta a futura promoção a subagente.
