# event-driven-state

> **Specification documental (governança-first, linguagem natural estruturada).** Segunda spec da
> Onda P1 (State). Fixa que o **estado evolui por eventos auditáveis, não por mutação implícita**:
> nenhuma alteração de estado sem evento correspondente; cada evento é unidade de mudança
> verificável, tenant-scoped, com origem, intenção, camada responsável e evidência. **Não** é
> machine-readable: não contém YAML, JSON, schema, DSL, pseudo-código nem contrato técnico
> executável.
>
> Onda: P1 (verdade operacional) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `event-driven-state` |
| **Camada** | `state` |
| **Owner arquitetural** | Estado |
| **Tenant-scope** | Global/instância (definição global, instância por tenant) |
| **Classe de operação** | transição-de-estado por evento |
| **Candidatura** | `service/tool` + `gov-doc` |
| **Dependências** | [`operational-state`](./operational-state.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md), [`conflict-resolution`](../p0/conflict-resolution.spec.md) |
| **Proveniência** | `[HARNESS-RT]` `[CE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `DO8` (event-driven operational state), `P9`, `DO6`.
- [`/docs/foundation/philosophy.md`](../../foundation/philosophy.md) §6 — trilha de auditoria orgânica; predição falsificável; reversão em granularidade fina.
- [`/docs/specs/p1/operational-state.spec.md`](./operational-state.spec.md) — estado como fonte de verdade; contrato leitura/escrita/evidência.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, que **toda mudança de estado é um evento auditável**
— com origem, momento e proveniência — e que **não há mutação silenciosa**. O estado da
[`operational-state`](./operational-state.spec.md) só evolui por eventos; o log de eventos permite
reconstruir o estado e atribuir falha.

A spec **extrai** (não inventa nem resume) `DO8` e a filosofia de auditoria, convertendo-os em
invariante contratual. Depende de `operational-state` e prepara `tenant-state-isolation` e
`memory-model` sem antecipá-las.

---

## 2. Problema que resolve

Mutação implícita de estado — alterar dados sem registrar como, quando, por quem e por quê — destrói
auditabilidade, impede atribuição de falha e permite que componentes sem autoridade (LLM/agente)
modifiquem a verdade silenciosamente.

Esta spec elimina o risco fixando o **evento** como única forma de alterar estado: verificável,
tenant-scoped, rastreável e reconstruível.

---

## 3. Autoridade envolvida

- **Validam e produzem eventos:** os **Services**, dentro de contratos de specification.
- **Produzem efeitos que geram evento:** as **Tools** — todo efeito de tool gera evento auditável.
- **Registra e coordena, mas NÃO decide a verdade do evento:** o **Runtime**.
- **NUNCA alteram estado diretamente:** conversa, resposta do agente, prompt e inferência do LLM
  (`P1`, `P18`).

---

## 4. Entradas esperadas

- Uma **intenção de mudança de estado** (proposta), com a operação que a motiva e o tenant.
- O estado atual e o contrato de service aplicável.

## 5. Saídas esperadas

- Um **evento validado** (origem, intenção operacional, camada responsável, momento, proveniência,
  evidência mínima) que efetiva a mudança; **ou**
- **Bloqueio / escalada registrada** quando o evento não puder ser validado.

---

## 6. Contrato esperado (linguagem natural)

1. **Nenhuma** alteração de estado **DEVE** ocorrer **sem evento correspondente** (não há mutação
   implícita) (`DO8`).
2. **Todo evento DEVE** ser **tenant-scoped** ([`tenant-boundary`](../p0/tenant-boundary.spec.md)).
3. **Todo evento DEVE** possuir **origem, intenção operacional, camada responsável e evidência
   mínima** (além de momento e proveniência).
4. O evento **NÃO É** log decorativo: é **unidade de mudança verificável**.
5. Conversa, resposta do agente, prompt ou inferência do LLM **NÃO DEVEM** alterar estado diretamente.
6. O **runtime** pode **registrar e coordenar** evento, mas **NÃO decide a verdade** do evento.
7. **Services validam e produzem** eventos dentro de contratos; **tools** podem produzir efeitos, mas
   esses efeitos **DEVEM gerar evento auditável**.
8. Quando um evento **não puder ser validado**, a alteração de estado **DEVE** ser **bloqueada ou
   escalada** (via [`conflict-resolution`](../p0/conflict-resolution.spec.md)).

---

## 7. Anatomia de um evento

Todo evento de estado **DEVE** carregar, no mínimo:

| Atributo | Significado |
| --- | --- |
| **Origem** | de onde partiu a mudança (service/tool/intervenção), nunca o modelo |
| **Intenção operacional** | que operação institucional o evento serve |
| **Camada responsável** | qual camada (Estado/Services/Tools) responde pela mudança |
| **Momento** | quando ocorreu |
| **Proveniência** | rastreabilidade à fonte, com nível de confiança (`DO6`) |
| **Evidência mínima** | o que mudou (antes/depois suficiente para auditoria) |
| **Tenant** | o tenant ao qual o evento pertence (tenant-scoped) |

---

## 8. Evento como unidade de mudança verificável

O evento **não** é um registro decorativo posterior à mudança: ele **é** a mudança. Daí decorre que:

1. O estado é **reconstruível** percorrendo o log de eventos (não há estado sem cadeia de eventos).
2. Cada evento é **falsificável/verificável** — pode ser checado contra o resultado (`[AHE]`/`[CE]`).
3. A trilha de auditoria **forma-se organicamente**, porque cada mudança preserva sua própria saída.
4. **Rollback conceitual** e **atribuição de falha** tornam-se possíveis: a linha de evolução do
   estado é navegável.

---

## 9. Quem pode produzir evento

| Camada | Papel no evento |
| --- | --- |
| **Services** | **validam e produzem** eventos dentro de contrato (autoridade de mudança) |
| **Tools** | produzem **efeitos**; todo efeito **gera evento auditável** |
| **Runtime** | **registra e coordena** eventos; não decide a verdade do evento |
| **Observabilidade** | reconstrói a linha de evolução do estado a partir dos eventos |
| **LLM / agente / prompt** | **nunca** alteram estado; podem apenas **propor** a operação (Metadata) |

---

## 10. Validação, bloqueio e escalada

- Um evento só efetiva mudança se **validado** contra o contrato de service e o tenant-scope.
- Evento **inválido, ambíguo ou sem atributo obrigatório** (§7) ⇒ **bloqueio** da mudança.
- Quando exigir decisão, **escalada registrada** (isolamento/segurança como valores superiores —
  [`conflict-resolution`](../p0/conflict-resolution.spec.md)).
- Nenhuma mutação não-validada é silenciosamente absorvida.

---

## 11. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Alterar estado **apenas** por evento validado (`DO8`).
2. Garantir que todo evento é tenant-scoped e tem origem/intenção/camada/evidência (§7).
3. Tratar o evento como unidade de mudança verificável, não log decorativo.
4. Impedir que conversa/agente/prompt/LLM alterem estado diretamente.
5. Manter o runtime como registrador/coordenador, não como decisor da verdade do evento.
6. Garantir que efeitos de tools geram evento auditável.
7. Permitir reconstrução do estado e atribuição de falha a partir do log.
8. Bloquear/escalar eventos não-validáveis.

---

## 12. Critérios de aceite

1. Referencia `DO8`/`P9`/`DO6` e a filosofia de auditoria sem contradizê-las nem duplicá-las.
2. Fixa "nenhuma mudança sem evento" e a anatomia mínima do evento (§6, §7).
3. Distingue evento de log decorativo (§8).
4. Atribui produção de evento a services/tools; runtime apenas registra/coordena (§9).
5. Fixa validação, bloqueio e escalada (§10).
6. Proíbe alteração direta por conversa/agente/prompt/LLM; é revisável por humano.

---

## 13. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Permite mutação de estado sem evento correspondente.
2. Admite evento sem tenant-scope ou sem origem/intenção/camada/evidência.
3. Trata evento como log decorativo em vez de unidade de mudança verificável.
4. Permite que conversa/agente/prompt/LLM altere estado diretamente.
5. Atribui ao runtime a decisão da verdade do evento.
6. Permite efeito de tool sem evento auditável.
7. Impede a reconstrução do estado ou a atribuição de falha.
8. Aceita evento não-validável sem bloqueio/escalada; ou introduz código/API/schema/YAML/JSON/
   contrato machine-readable; ou reposiciona o YZI OS.

---

## 14. Relação com as camadas do YZI OS

A autoridade de **mudança** pertence a Services (validam/produzem) e Tools (efeito → evento); o
Estado registra a verdade resultante (posição 1); o Runtime coordena sem decidir; Agents/LLM/prompt
não alteram. Tudo dentro do tenant ([`tenant-boundary`](../p0/tenant-boundary.spec.md)) e da escada
de [`layer-authority-model`](../p0/layer-authority-model.spec.md).

---

## 15. Relação com specifications futuras

Depende de [`operational-state`](./operational-state.spec.md) e sustenta `tenant-state-isolation`
(eventos não cruzam tenant) e `memory-model` (memória episódica = log de eventos). As specs de
observabilidade (`episode-trace`, `audit-log`, `failure-attribution`) e os harnesses de
observabilidade/auditoria herdam este invariante — ver
[Specification Map](../../specification-engineering/specification-map.md).

---

## 16. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Limite imposto pelo estado por evento |
| --- | --- |
| **Skill** | propõe mudança; nunca emite evento nem altera estado |
| **Subagente** | propõe operação; a mudança vira evento via service |
| **Harness** | o `runtime-harness` registra/coordena eventos; o `observability/audit-harness` reconstrói a linha |
| **Service** | valida e produz eventos dentro de contrato (única autoridade de mudança) |
| **Tool** | produz efeito que **gera evento auditável**, com tenant context |
| **LLM / agente de código** | nunca altera estado; descreve a operação, não o evento da verdade |

---

## 17. Método de verificação

1. **Reconstrução:** reconstruir o estado a partir do log de eventos e comparar com o estado vigente.
2. **Ausência de mutação não-evento:** verificar que não há mudança de estado sem evento correspondente.
3. Verificar que todo evento tem os atributos obrigatórios (§7) e é tenant-scoped.
4. Verificar que nenhuma alteração veio de conversa/agente/prompt/LLM.
5. Verificar que efeitos de tools geraram eventos auditáveis.
6. Verificar que eventos não-validáveis geraram bloqueio/escalada.
7. Violação ⇒ rejeição/escalada; verificação independente do agente e reconstruível.

---

## 18. Observabilidade esperada

- Log de eventos que permite **reconstruir a linha de evolução do estado** (rollback conceitual).
- Registro de **atribuição de falha** a partir dos eventos (reproduzir → atribuir → corrigir →
  verificar → reportar).
- Registro de bloqueios/escaladas de eventos não-validáveis.
- Trilha auditável e read-only para o artefato que ela fiscaliza (`P9`, `DO6`).

---

## 19. Riscos arquiteturais evitados

- **Mutação implícita** — estado alterado sem evento (`DO8`).
- **Estado inventado** — LLM/agente/prompt mudando a verdade diretamente.
- **Log decorativo** — registro que não é a própria mudança verificável.
- **Falha não-atribuível** — impossibilidade de reconstruir a linha de evolução.
- **Efeito sem rastro** — tool com side effect sem evento auditável.

---

## 20. Fora de escopo

- **Não** redefine o estado como verdade (isso é `operational-state`) nem o isolamento de estado
  (`tenant-state-isolation`) nem as formas de memória (`memory-model`) — apenas os referencia.
- **Não** define o formato técnico do evento (sem schema/JSON): apenas seus atributos em linguagem
  natural.
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  YAML/JSON ou contrato machine-readable.

---

## 21. Proveniência

`[HARNESS-RT]` AI Harness Runtime — verificação como runtime; atribuição de falha antes de correção;
estado de tarefa como responsabilidade de runtime. `[CE]` Context Engineering — trilha de auditoria
orgânica; cada estágio preserva sua saída; reversão em granularidade fina.

---

## 22. Fronteiras (o que NÃO está aqui)

- **Não** substitui `DO8` nem a filosofia de auditoria: é a spec que os **opera** como contrato de
  evolução de estado verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura — apenas fixa o invariante de evolução por evento que as demais
  herdam.
