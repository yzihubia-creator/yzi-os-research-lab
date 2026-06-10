# operational-boundaries

> **Specification documental (governança-first, linguagem natural estruturada).** Spec da Onda P2
> (Governance). Define as **fronteiras operacionais** que restringem o espaço de ação dos agentes do
> YZI OS: limites deliberados, verificáveis e auditáveis, sob o princípio **"restringir habilita
> autonomia"**. Qualquer tentativa de bypass de policy, tenant scope, auditabilidade ou authority
> layer **DEVE** ser bloqueada e gerar evidência. **Não** é machine-readable: não contém YAML, JSON,
> schema, DSL, pseudo-código nem contrato técnico executável.
>
> Onda: P2 (governança + contexto) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `operational-boundaries` |
| **Camada** | `governance` |
| **Owner arquitetural** | Governança |
| **Tenant-scope** | Global/instância (definição global, instância por tenant) |
| **Classe de operação** | delimitação de fronteira |
| **Candidatura** | `gov-doc` + `harness` (`governance-harness`) |
| **Dependências** | [`policy-enforcement`](./policy-enforcement.spec.md), [`layer-authority-model`](../p0/layer-authority-model.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md), [`conflict-resolution`](../p0/conflict-resolution.spec.md) |
| **Proveniência** | `[HE-GOV]` `[PYR]` `[CE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P12`, `DO5`; autoridade por camada (`P1`, `P6`); auditabilidade (`P9`).
- [`/docs/foundation/philosophy.md`](../../foundation/philosophy.md) §4 — "restringir o runtime habilita mais autonomia".
- [`/docs/foundation/manifesto.md`](../../foundation/manifesto.md) §5 — confie na arquitetura; o runtime tem de ser restringido.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, as **fronteiras operacionais** que **restringem o
espaço de ação** dos agentes do YZI OS. O espaço de ação é **deliberadamente estreitado por
enforcement**; ações fora da fronteira são **bloqueadas**, e a fronteira é **verificável
independentemente do agente**. Princípio diretor: **"restringir habilita autonomia"** — a confiança
para delegar cresce na exata medida em que o espaço de ação é estreitado.

A spec **extrai** (não inventa nem resume) `P12`/`DO5` e a filosofia de restrição. Apoia-se no
enforcement determinístico de [`policy-enforcement`](./policy-enforcement.spec.md).

---

## 2. Problema que resolve

Um agente com espaço de ação irrestrito é, por construção, não-confiável: pode contornar policy,
cruzar tenant, agir sem rastro ou assumir autoridade que não tem. Sem fronteiras verificáveis, a
autonomia degenera em risco.

Esta spec elimina o risco fixando fronteiras **explícitas, verificáveis e auditáveis**, e tornando
toda tentativa de bypass um evento **bloqueado e evidenciado**.

---

## 3. Autoridade envolvida

- **Definem e verificam as fronteiras:** Governança/Policies e Services, aplicadas pelo
  `governance-harness`.
- **Restringido pela fronteira:** o **agente** (e o LLM/prompt) — opera **dentro** do espaço
  permitido; não amplia a própria fronteira.
- **Aciona, mas não decide:** o runtime aplica a fronteira sem decidir o que é permitido.

---

## 4. Entradas esperadas

- A operação/ação proposta, com seu tenant, autoridade pretendida e policies aplicáveis.
- A definição das fronteiras vigentes (policy, tenant scope, auditabilidade, authority layer).

## 5. Saídas esperadas

Toda avaliação de fronteira produz **uma de quatro saídas**:

- **Continuar (permitido)** — ação dentro da fronteira.
- **Bloquear** — ação ou tentativa de bypass fora da fronteira.
- **Pendente de evidência** — falta evidência verificável; a ação aguarda até existir.
- **Escalar (registrado)** — excede a fronteira de decisão automática; segue ao operador humano.

Evidência é registrada em todos os casos relevantes (violação consumada e tentativa).

---

## 6. Contrato esperado (linguagem natural)

1. O espaço de ação do agente **DEVE** ser **deliberadamente estreitado** por enforcement
   ("restringir habilita autonomia").
2. **Ações fora da fronteira DEVEM** ser **bloqueadas**.
3. A fronteira **DEVE** ser **verificável independentemente do agente**.
4. **Qualquer tentativa de bypass** de **policy, tenant scope, auditabilidade ou authority layer**
   **DEVE** ser **bloqueada**.
5. As fronteiras operacionais **DEVEM** ser **observáveis e auditáveis**.
6. **Toda violação ou tentativa de violação DEVE** gerar **evidência**.
7. O agente, o LLM e o prompt **NÃO DEVEM** ampliar a própria fronteira nem assumir autoridade fora
   dela.
8. A fronteira opera como **limite de quatro saídas**: **continuar, bloquear, pendente de evidência ou
   escalar** (§5).
9. **Ausência de evidência suficiente DEVE** gerar **bloqueio, pendência de evidência ou escalada** —
   nunca prosseguimento.
10. **Nenhuma operação DEVE** ultrapassar **estado, tenant boundary, policy, specification ou authority
    layer**.
11. Por camada: **tools** só **DEVEM** ser acionadas dentro de **permissão explícita e tenant válido**;
    **services** decidem dentro de contratos, mas **NÃO violam policies**; o **runtime** coordena, mas
    **NÃO amplia escopo operacional**; o **agente** propõe, mas **NÃO autoriza extrapolação**; o **LLM
    NÃO decide exceção operacional**; o **prompt NÃO suspende a fronteira**.
12. **Prevalências** (ordem de valores de [`conflict-resolution`](../p0/conflict-resolution.spec.md)):
    **segurança > conveniência** · **auditabilidade > velocidade** · **tenant boundary > experiência do
    usuário**.

---

## 7. O que é uma fronteira operacional

Uma fronteira operacional é um **limite deliberado** do espaço de ação, codificado fora da linguagem e
aplicado por enforcement. Decorre do paradoxo produtivo: **restringir o espaço de solução aumenta a
confiança no comportamento** (`philosophy.md` §4). A fronteira:

- é **explícita** (declarada, não implícita);
- é **verificável** independentemente de quem age;
- **estreita** permissões (consistente com atenuação de privilégio na delegação);
- **não** é ampliável pelo próprio agente.

---

## 8. Fronteiras protegidas e bypass bloqueado

Toda tentativa de contornar qualquer destas fronteiras **DEVE** ser bloqueada e evidenciada:

| Fronteira | O que protege | Bypass bloqueado |
| --- | --- | --- |
| **Estado** | a verdade operacional persistida | nenhuma operação ultrapassa/sobrescreve o estado fora de evento validado (`operational-state`, `event-driven-state`) |
| **Tenant scope** | a partição multi-tenant | nenhuma ação cruza a fronteira de tenant (`tenant-boundary`) |
| **Policy** | a aplicação determinística de policies | nenhuma operação contorna o enforcement (`policy-enforcement`) |
| **Specification** | o contrato da classe de operação | nenhuma operação age fora do que sua specification define (`P15`) |
| **Auditabilidade** | a trilha de evidência | nenhuma ação ocorre sem rastro; o executor não desliga a fiscalização (`P9`) |
| **Authority layer** | a escada de autoridade | nenhum agente/LLM assume autoridade de camada superior (`layer-authority-model`) |

---

## 9. Observabilidade e evidência de violação

1. As fronteiras são **observáveis e auditáveis**: pode-se verificar, a qualquer momento, se uma ação
   respeitou os limites.
2. **Toda violação** (ação fora da fronteira) **e toda tentativa de violação** (bypass barrado) gera
   **evidência registrada** — não apenas a violação consumada.
3. A evidência alimenta a auditoria e a atribuição de falha; nenhuma tentativa é silenciosamente
   descartada.

---

## 10. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Estreitar o espaço de ação por enforcement (`P12`, `DO5`).
2. Bloquear ações fora da fronteira.
3. Tornar a fronteira verificável independentemente do agente.
4. Bloquear toda tentativa de bypass de policy/tenant scope/auditabilidade/authority layer.
5. Tornar as fronteiras observáveis e auditáveis.
6. Gerar evidência de toda violação e tentativa de violação.
7. Impedir o agente/LLM/prompt de ampliar a própria fronteira.
8. Escalar quando a decisão de fronteira exceder o automático.

---

## 11. Critérios de aceite

1. Referencia `P12`/`DO5` e a filosofia de restrição sem contradizê-las nem duplicá-las.
2. Fixa "restringir habilita autonomia" e o bloqueio de ações fora da fronteira (§6, §7).
3. Enumera as fronteiras protegidas e o bloqueio de bypass (§8).
4. Fixa observabilidade/auditabilidade das fronteiras e evidência de violação/tentativa (§9).
5. Impede o agente de ampliar a própria fronteira.
6. Apoia-se em enforcement determinístico; é revisável por humano.

---

## 12. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Deixa o espaço de ação irrestrito ou ampliável pelo agente.
2. Não bloqueia ação fora da fronteira.
3. Torna a fronteira dependente do agente para ser verificada.
4. Permite bypass de policy, tenant scope, auditabilidade ou authority layer.
5. Torna as fronteiras não-observáveis ou não-auditáveis.
6. Não gera evidência de violação ou de tentativa de violação.
7. Introduz código/API/schema/YAML/JSON/contrato machine-readable; ou reposiciona o YZI OS.

---

## 13. Relação com as camadas do YZI OS

As fronteiras operacionais protegem a **escada de autoridade** (`layer-authority-model`), a **partição
de tenant** (`tenant-boundary`), a **auditabilidade** (Observabilidade) e o **enforcement** (Policies).
São definidas pela Governança, aplicadas pelo `governance-harness`, acionadas pelo runtime; os Agents
operam dentro delas.

---

## 14. Relação com specifications futuras

Depende de [`policy-enforcement`](./policy-enforcement.spec.md) e complementa
[`behavioral-governance`](./behavioral-governance.spec.md). Prepara `escalation-policy` (o que fazer
ao exceder a fronteira de decisão) e é instanciada por tenant via `tenant-policy-pack` — ver
[Specification Map](../../specification-engineering/specification-map.md). O `governance-harness` e o
`escalation-harness` a materializam.

---

## 15. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Limite imposto pelas fronteiras operacionais |
| --- | --- |
| **Skill** | age só dentro da fronteira; não amplia o próprio escopo |
| **Subagente** | recebe fronteira estreitada (atenuação de privilégio); não a expande |
| **Harness** | o `governance-harness` aplica/verifica; o `escalation-harness` trata o exceder de fronteira |
| **Service** | decide dentro de contrato, mas **não viola policies**; aplica a fronteira |
| **Tool** | só é acionada com **permissão explícita e tenant válido**, dentro da fronteira |
| **LLM / agente de código** | **não decide exceção operacional**; o prompt não suspende a fronteira; opera no espaço estreitado |

---

## 16. Método de verificação

1. **Bloqueio fora da fronteira:** verificar que ações fora dos limites são bloqueadas.
2. **Independência do agente:** verificar que a fronteira é verificável sem confiar no agente.
3. Verificar que tentativas de bypass de policy/tenant/auditoria/autoridade são barradas.
4. Verificar que as fronteiras são observáveis/auditáveis e que toda violação/tentativa gera evidência.
5. Verificar que o agente não ampliou a própria fronteira.
6. Violação ⇒ rejeição/escalada; verificação independente do agente e reconstruível.

---

## 17. Observabilidade esperada

- Registro, por ação: fronteira aplicável · veredito (dentro/bloqueado) · tipo de bypass barrado (se
  houver) · tenant · proveniência.
- Registro de **toda violação e tentativa de violação** como evidência.
- Trilha auditável e read-only para o artefato que ela fiscaliza (`P9`, `DO6`).

---

## 18. Riscos arquiteturais evitados

- **Autonomia irrestrita** — espaço de ação sem limites verificáveis.
- **Auto-ampliação de fronteira** — agente expandindo o próprio escopo.
- **Bypass** — contornar policy, tenant scope, auditabilidade ou authority layer.
- **Violação silenciosa** — tentativa de bypass sem evidência.
- **Fronteira dependente do agente** — limite que só "vale" se o agente cooperar.

---

## 19. Fora de escopo

- **Não** define o **mecanismo** de enforcement (`policy-enforcement`), o conteúdo comportamental
  (`behavioral-governance`) nem a escalação em detalhe (`escalation-policy`) — apenas a **delimitação**
  das fronteiras.
- **Não** cria o `governance-harness`/`escalation-harness` executável nem nenhuma outra spec.
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  sprint plan, YAML/JSON, contrato machine-readable ou implementation harness.

---

## 20. Proveniência

`[HE-GOV]` Harness Engineering / Governança — "restringir habilita autonomia"; enforcement
determinístico; o runtime tem de ser restringido. `[PYR]` Context→Intent→Specification — fronteiras de
visibilidade e permissão; atenuação de privilégio. `[CE]` Context Engineering — confiar na arquitetura;
auditoria orgânica.

---

## 21. Fronteiras (o que NÃO está aqui)

- **Não** substitui `P12`/`DO5` nem a filosofia de restrição: é a spec que os **opera** como contrato
  de fronteiras operacionais verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura — apenas fixa as fronteiras operacionais que as demais herdam.
