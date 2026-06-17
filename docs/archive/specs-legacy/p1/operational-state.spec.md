# operational-state

> **Specification documental (governança-first, linguagem natural estruturada).** Primeira spec da
> Onda P1 (State). Define o **estado operacional persistido como fonte de verdade** do YZI OS e a
> **conversa como sua projeção**. Fixa que a continuidade deriva do estado — não da conversa nem da
> memória do modelo — e que LLM/agente/prompt não têm autoridade para inventar, sobrescrever ou
> substituir estado. **Não** é machine-readable: não contém YAML, JSON, schema, DSL, pseudo-código
> nem contrato técnico executável.
>
> Onda: P1 (verdade operacional) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `operational-state` |
| **Camada** | `state` |
| **Owner arquitetural** | Estado |
| **Tenant-scope** | Global/instância (definição global, instância por tenant) |
| **Classe de operação** | persistência / verdade operacional |
| **Candidatura** | `service/tool` (state service) + `gov-doc` |
| **Dependências** | [`layer-authority-model`](../p0/layer-authority-model.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md) |
| **Proveniência** | `[PYR]` `[CE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P3`, `P17`, `DO1`, `DO8`.
- [`/docs/foundation/philosophy.md`](../../foundation/philosophy.md) §2 — backend decide; estado > memória conversacional; quatro formas de memória; Referência Mestra.
- [`/docs/specs/p0/tenant-boundary.spec.md`](../p0/tenant-boundary.spec.md) — estado particionado por tenant.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, que o **estado persistido é a fonte de verdade** do
YZI OS: a continuidade operacional é função do estado, não da conversa nem da memória do modelo; e a
**conversa é projeção do estado**, nunca sua fonte. Encerrar uma sessão ou trocar de modelo **não**
interrompe a continuidade.

A spec **extrai** (não inventa nem resume) `P3`/`P17`/`DO1`/`DO8` e a filosofia de estado,
convertendo-os em invariante contratual. É a raiz da Onda P1, da qual derivam `event-driven-state`,
`tenant-state-isolation` e `memory-model`.

---

## 2. Problema que resolve

Sistemas centrados no modelo derivam continuidade da **conversa** ou da **memória do modelo** — ambas
frágeis, opacas à auditoria e não-portáveis. Isso produz perda de continuidade ao encerrar sessão ou
trocar modelo, e abre caminho para que o modelo "invente" estado.

Esta spec elimina o risco fixando o **estado persistido** como única fonte de verdade: recuperável,
isolável e auditável, com continuidade independente da conversa e do modelo (Referência Mestra).

---

## 3. Autoridade envolvida

- **Detém autoridade sobre a verdade:** o Estado persistido (posição 1 da escada de autoridade) e os
  Services que o atualizam dentro de contrato.
- **Acessa/coordena, mas NÃO é a verdade:** o Runtime — lê e coordena estado, sem ser fonte de verdade
  nem deter autoridade comportamental (`P6`, `P13`).
- **NUNCA detêm autoridade sobre o estado:** o LLM, o agente e o prompt — não podem inventar,
  sobrescrever nem substituir estado operacional (`P1`, `P18`).

---

## 4. Entradas esperadas

- O estado persistido atual (recuperável, tenant-scoped) e seu histórico.
- A operação proposta, com a declaração de **quais estados lê** e **quais estados pretende alterar**.

## 5. Saídas esperadas

- O estado atualizado (quando autorizado, via service, dentro de contrato e do tenant).
- A **evidência** da leitura/alteração (o que foi lido, o que mudou, com proveniência) — base de
  auditoria.

---

## 6. Contrato esperado (linguagem natural)

1. O **estado persistido governa a continuidade**; a continuidade **NÃO DEVE** depender da conversa
   nem da memória do modelo (`P3`, `P17`).
2. A **conversa é projeção do estado**, **NUNCA** sua fonte de verdade.
3. **Estado operacional ≠ memória conversacional**: são naturezas distintas e não intercambiáveis.
4. O estado **DEVE** ser **auditável, recuperável, tenant-scoped e verificável**.
5. **Toda operação futura DEVE declarar** quais estados **lê**, quais estados **altera** e qual
   **evidência** produz (contrato leitura/escrita/evidência).
6. O **runtime acessa e coordena** o estado, mas **NÃO é a verdade** nem a governa.
7. **LLM, agente e prompt NUNCA** podem inventar, sobrescrever ou substituir estado operacional;
   alteração de estado ocorre só via service, dentro de contrato e do tenant.
8. Encerrar sessão ou trocar de modelo **NÃO DEVE** interromper a continuidade (Referência Mestra).

---

## 7. Estado operacional vs. memória conversacional

| Dimensão | Estado operacional (verdade) | Memória conversacional (não-verdade) |
| --- | --- | --- |
| Natureza | persistido, estruturado | efêmero, textual |
| Auditoria | recuperável e auditável | opaca |
| Portabilidade | portável, isolável | não-portável |
| Continuidade | governa a continuidade | recomeça em branco a cada chamada |
| Autoridade | fonte de verdade | projeção / Metadata |

A conversa é uma **projeção** do estado para fins linguísticos; jamais o substitui. A continuidade
não é "lembrar" — é montar, a cada passo, o recorte correto do estado, preservando histórico e
proveniência (`philosophy.md` §2).

---

## 8. Propriedades obrigatórias do estado

1. **Auditável** — toda leitura/alteração é rastreável com proveniência (`P9`, `DO6`).
2. **Recuperável** — o estado pode ser reconstruído e consultado a qualquer momento.
3. **Tenant-scoped** — particionado por tenant; nenhum acesso cruza a fronteira
   ([`tenant-boundary`](../p0/tenant-boundary.spec.md)).
4. **Verificável** — a continuidade e a integridade do estado podem ser checadas
   deterministicamente.

---

## 9. Contrato de leitura/escrita/evidência por operação

Toda operação futura que toque o estado **DEVE** declarar, de forma verificável:

- **Lê:** quais estados/recortes consulta (com tenant-scope).
- **Altera:** quais estados modifica (e sob qual contrato/service).
- **Evidência:** qual registro auditável a operação produz (o que mudou, quando, com que proveniência).

Operações sem essa declaração **não** são conformes. Esta tríade prepara o terreno para
`event-driven-state` (alteração só por evento auditável) sem antecipá-la.

---

## 10. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Tratar o estado persistido como única fonte de verdade (`P3`, `P17`).
2. Tratar a conversa como projeção, nunca como fonte.
3. Manter estado operacional distinto de memória conversacional.
4. Garantir estado auditável, recuperável, tenant-scoped e verificável.
5. Declarar leitura/escrita/evidência (§9).
6. Impedir que LLM/agente/prompt invente, sobrescreva ou substitua estado.
7. Manter o runtime como acessor/coordenador, não como verdade.
8. Preservar a continuidade sob fim de sessão e troca de modelo.

---

## 11. Critérios de aceite

1. Referencia `P3`/`P17`/`DO1`/`DO8` e a filosofia de estado sem contradizê-las nem duplicá-las.
2. Fixa estado como fonte de verdade e conversa como projeção (§6, §7).
3. Distingue estado operacional de memória conversacional (§7).
4. Fixa as quatro propriedades obrigatórias do estado (§8).
5. Fixa o contrato leitura/escrita/evidência (§9).
6. Proíbe LLM/agente/prompt de inventar/sobrescrever/substituir estado; é revisável por humano.

---

## 12. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Deriva continuidade da conversa ou da memória do modelo.
2. Trata a conversa como fonte de verdade.
3. Funde estado operacional com memória conversacional.
4. Permite estado não-auditável, não-recuperável, não-tenant-scoped ou não-verificável.
5. Permite operação que não declara leitura/escrita/evidência.
6. Permite que LLM/agente/prompt invente, sobrescreva ou substitua estado.
7. Atribui ao runtime o papel de fonte de verdade ou de governança do estado.
8. Introduz código, API, schema, YAML/JSON, DSL ou contrato machine-readable; ou reposiciona o YZI OS.

---

## 13. Relação com as camadas do YZI OS

O estado ocupa a **posição 1** da escada de autoridade de
[`layer-authority-model`](../p0/layer-authority-model.spec.md): governa a verdade. Services decidem e
atualizam dentro de contrato; o runtime acessa/coordena sem governar; agents/tools/LLM não detêm
autoridade sobre o estado. O isolamento por tenant herda
[`tenant-boundary`](../p0/tenant-boundary.spec.md).

---

## 14. Relação com specifications futuras

`operational-state` é a **raiz da Onda P1**. Dependem dela diretamente: `event-driven-state` (o estado
evolui por eventos auditáveis), `tenant-state-isolation` (estado inacessível cross-tenant) e
`memory-model` (quatro formas de memória + Referência Mestra) — ver
[Specification Map](../../specification-engineering/specification-map.md). Toda spec de runtime,
agente, service, tool, observabilidade e harness que toque continuidade **DEVE** respeitar este
invariante.

---

## 15. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Limite imposto pelo estado-verdade |
| --- | --- |
| **Skill** | lê o recorte de estado declarado; não inventa nem altera estado |
| **Subagente** | opera sobre estado dentro do tenant; propõe alterações, não as decide |
| **Harness** | o `runtime-harness` acessa/coordena estado; não é a verdade nem o governa |
| **Service** | decide e atualiza estado dentro de contrato (única via de alteração) |
| **Tool** | executa alteração só via service/registro, com trace e tenant context |
| **LLM / agente de código** | nunca inventa/sobrescreve/substitui estado; descreve, não decide |

---

## 16. Método de verificação

1. **Continuidade sob descontinuidade:** verificar que a continuidade sobrevive ao fim de sessão e à
   troca de modelo (Referência Mestra).
2. Verificar que a conversa **nunca** é tratada como fonte de verdade.
3. Verificar que toda operação declara leitura/escrita/evidência (§9).
4. Verificar que nenhuma alteração de estado foi feita por LLM/agente/prompt fora de service.
5. Verificar auditabilidade, recuperabilidade, tenant-scope e verificabilidade do estado.
6. Violação ⇒ rejeição/escalada; verificação independente do agente e reconstruível.

---

## 17. Observabilidade esperada

- Registro, por operação: estados lidos · estados alterados · evidência produzida · tenant · proveniência.
- Registro de continuidade preservada sob fim de sessão / troca de modelo.
- Trilha auditável e read-only para o artefato que ela fiscaliza (`P9`, `DO6`).

---

## 18. Riscos arquiteturais evitados

- **Perda de continuidade** — depender da conversa/memória do modelo (`P3`, `P17`).
- **Conversa virar verdade** — projeção tratada como fonte.
- **Estado inventado** — LLM/agente sobrescrevendo ou fabricando estado.
- **Estado opaco** — não-auditável/não-recuperável/não-verificável.
- **Runtime como verdade** — coordenação confundida com autoridade sobre o estado.

---

## 19. Fora de escopo

- **Não** define a evolução por eventos (isso é `event-driven-state`), o isolamento de estado em
  detalhe (`tenant-state-isolation`) nem as formas de memória (`memory-model`) — apenas as referencia.
- **Não** cria nenhuma outra spec da Onda P1.
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  YAML/JSON ou contrato machine-readable.

---

## 20. Proveniência

`[PYR]` Context→Intent→Specification — operação institucional stateful; memória como ambiente que se
administra; estado recuperável/isolável/auditável; backend decide. `[CE]` Context Engineering —
continuidade vem do arquivo, não da memória do modelo; Referência Mestra; trilha de auditoria orgânica.

---

## 21. Fronteiras (o que NÃO está aqui)

- **Não** substitui `P3`/`P17` nem a filosofia de estado: é a spec que os **opera** como contrato de
  verdade operacional verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura — apenas fixa o invariante de verdade operacional que as demais
  herdam.
