# conflict-resolution

> **Specification documental (governança-first, linguagem natural estruturada).** Terceira spec da
> Onda P0. Fixa, como invariante contratual, **como o YZI OS resolve conflitos**: pela **ordem de
> valores**, nunca pela numeração de princípio; com **escalada registrada** quando não houver
> resolução segura; e com **evidência auditável** em toda resolução. **Não** é machine-readable:
> não contém YAML, JSON, schema, DSL, pseudo-código nem contrato técnico executável.
>
> Onda: P0 (fundacional) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `conflict-resolution` |
| **Camada** | `foundation` |
| **Owner arquitetural** | Fundação |
| **Tenant-scope** | Global (invariante cross-tenant) |
| **Classe de operação** | arbitragem / resolução |
| **Candidatura** | `gov-doc` (governança documental) |
| **Dependências** | [`core-operational-principles`](./core-operational-principles.spec.md), [`layer-authority-model`](./layer-authority-model.spec.md) |
| **Proveniência** | `[CE]` `[PYR]` `[HE-GOV]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — "Regra de resolução de conflito entre princípios" (ordem de valores).
- [`/docs/foundation/manifesto.md`](../../foundation/manifesto.md) — raiz da hierarquia documental; "em caso de conflito, este documento prevalece".
- [`/docs/foundation/philosophy.md`](../../foundation/philosophy.md) — backend decide; estado > memória conversacional; auditoria/isolamento não-opcionais.
- [`/docs/specs/p0/core-operational-principles.spec.md`](./core-operational-principles.spec.md) — invariantes `P1–P18`/`DO1–DO10`.
- [`/docs/specs/p0/layer-authority-model.spec.md`](./layer-authority-model.spec.md) — distribuição de autoridade.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, o procedimento único de resolução de conflitos do
YZI OS. Quando dois ou mais princípios, specs, policies ou decisões parecerem conflitar num caso
concreto, a resolução **DEVE** preservar os valores na **ordem de prioridade** definida na §7 — e
**nunca** decidir pelo número do princípio. Quando nenhuma opção for segura, a única saída correta é
**escalada registrada**.

A spec **extrai** (não inventa nem resume) a regra de resolução já consolidada em `principles.md`,
convertendo-a em procedimento contratual auditável.

---

## 2. Problema que resolve

Sem um procedimento único, conflitos seriam resolvidos ad hoc — por intuição do agente, por ordem de
listagem dos princípios, ou pela formulação do prompt. Isso produziria decisões não-reconstruíveis,
inconsistentes entre operações e potencialmente atribuídas ao modelo.

Esta spec elimina o risco fixando **uma** hierarquia de valores, **um** procedimento de arbitragem e
**uma** saída de exceção (escalada), todos auditáveis.

---

## 3. Autoridade envolvida

- **Detém autoridade de arbitragem:** a lógica institucional (Services/Governança) aplicando a ordem
  de valores; em impasse seguro-impossível, o **operador humano** via escalada.
- **NÃO detém autoridade:** o LLM, o agente, o prompt e o runtime — nenhum deles pode **decidir** um
  conflito nem ter a decisão atribuída a si.

---

## 4. Entradas esperadas

- O conjunto de **invariantes/valores em tensão** num caso concreto (princípios, specs, policies,
  decisões).
- As opções de resolução possíveis e o que cada uma preserva ou viola.

## 5. Saídas esperadas

- Uma **resolução escolhida**, com o registro do valor de maior prioridade preservado e a
  justificativa pela ordem de valores; **ou**
- Uma **escalada registrada** ao operador humano, quando nenhuma opção for segura.
- Em ambos os casos: **evidência auditável** reconstruível.

---

## 6. Contrato esperado (linguagem natural)

1. Todo conflito **DEVE** ser resolvido preservando o valor de **maior prioridade** na ordem da §7.
2. A numeração de princípios `P*` **NUNCA DEVE** ser usada como critério de prioridade.
3. Nenhuma decisão de conflito **DEVE** atribuir autoridade ao LLM, agente, prompt ou runtime.
4. Quando o conflito **não puder ser resolvido com segurança**, a única saída correta é **escalada
   registrada** ao operador humano.
5. **Toda** resolução de conflito **DEVE** gerar **evidência auditável** (valores em tensão, opções,
   valor preservado, justificativa, decisor).
6. **Estado persistido e fontes de Authority** (specs, policies) **prevalecem** sobre resposta do
   agente, prompt, memória conversacional ou inferência do modelo (`P1`, `P17`, Paradoxo do Metadado).
7. **Segurança e isolamento multi-tenant NUNCA** podem ser sacrificados por conveniência operacional
   (valores 2 e 3 da §7).
8. **Auditabilidade NUNCA** pode ser removida para acelerar execução (valor 4; `P8`, `P9`).

---

## 6-A. Domínios de conflito cobertos

Este procedimento aplica-se a conflitos entre quaisquer dos seguintes — sem exceção:

princípios · camadas · policies · specifications · contexto recuperado · estado operacional ·
intenção do operador · resposta do agente · execução de tools · fronteiras multi-tenant · critérios
de auditoria.

Notas de prevalência (derivadas das fontes canônicas):
- **Estado operacional** prevalece sobre **resposta do agente / memória conversacional / inferência
  do modelo** (`philosophy.md` §2; `P17`).
- **Fronteiras multi-tenant** e **critérios de auditoria** **não** cedem a intenção do operador
  quando isso introduziria risco de segurança ou perda de rastreabilidade — nesse caso, **escalada**.
- **Conflitos entre documentos** seguem a hierarquia documental (`manifesto` › `mission`/
  `philosophy` › `principles` › demais); o `manifesto.md` prevalece, "como uma camada de Authority
  prevalece sobre instruções de menor prioridade".

---

## 7. Ordem de valores (hierarquia normativa)

A resolução preserva os seguintes valores, **nesta ordem de prioridade** (fonte canônica:
[`principles.md`](../../foundation/principles.md)):

| # | Valor | Significado operacional |
| --- | --- | --- |
| 1 | **Verdade operacional** | o estado persistido e a lógica institucional permanecem fonte de verdade |
| 2 | **Segurança** | nenhuma resolução pode introduzir risco operacional ou de segurança |
| 3 | **Isolamento multi-tenant** | a fronteira entre tenants é inviolável |
| 4 | **Auditabilidade** | a ação resultante permanece rastreável e auditável |
| 5 | **Governança institucional** | políticas e specifications continuam aplicáveis |
| 6 | **Continuidade de estado** | a continuidade operacional não é sacrificada |
| 7 | **Desacoplamento linguagem/operação** | a separação camada linguística / operacional é mantida |
| 8 | **Leveza do runtime** | o runtime permanece mínimo e sem autoridade comportamental |

Esta ordem — e **não** o número do princípio — governa a resolução. A numeração `P1…P18` serve
unicamente como referência estável de citação. A hierarquia documental (`manifesto` ›
`mission`/`philosophy` › `principles` › demais) permanece válida para conflitos **entre documentos**.

---

## 8. Procedimento de resolução

1. **Identificar** os invariantes/valores em tensão e enumerar as opções de resolução.
2. **Mapear** cada opção ao valor de **maior prioridade** que ela preserva e ao que ela viola.
3. **Escolher** a opção que preserva o valor de maior prioridade na ordem da §7; em empate de valor,
   descer na ordem até desempatar.
4. **Não** usar a numeração `P*` em nenhum passo como critério de prioridade.
5. Se **nenhuma** opção for segura (passo 2 da ordem comprometido sem alternativa), **não decidir** —
   acionar a **escalada** (§9).
6. **Registrar** a resolução (ou a escalada) como evidência auditável (§17).

---

## 9. Escalada (saída de exceção)

- A escalada é acionada quando o conflito **não pode ser resolvido com segurança** pela ordem de
  valores, ou quando preservar o valor de maior prioridade exigiria violar Segurança (valor 2).
- A escalada é **sempre registrada**: nenhum conflito inseguro é silenciosamente absorvido.
- A decisão escalada pertence ao **operador humano**; a responsabilidade é preservada e registrada.
- A escalada **NUNCA** transfere a decisão ao LLM/agente/prompt/runtime.
- Liga-se às specs futuras `escalation-policy` e ao registro `intervention-log`
  (ver [Specification Map](../../specification-engineering/specification-map.md)).

---

## 10. Regras de conformidade

Toda resolução de conflito **DEVE**:

1. Aplicar a ordem de valores da §7, jamais a numeração (`P*`).
2. Preservar Verdade operacional e Segurança acima de tudo (valores 1 e 2).
3. Preservar o isolamento multi-tenant como inviolável (valor 3, `P10`).
4. Não atribuir a decisão ao LLM/agente/prompt/runtime (`P1`, `P2`, `P6`, `P18`).
5. Escalar quando não houver resolução segura, com registro (§9).
6. Produzir evidência auditável e reconstruível (`P8`, `P9`, `DO7`).

---

## 11. Critérios de aceite

1. Referencia a regra canônica de `principles.md` sem contradizê-la nem duplicá-la integralmente.
2. Fixa a ordem de valores (§7) e o procedimento (§8) como contrato verificável.
3. Define a escalada (§9) como única saída quando não há resolução segura.
4. Proíbe atribuição de autoridade ao LLM/agente/prompt/runtime.
5. Exige evidência auditável em toda resolução.
6. É revisável por humano, em linguagem natural estruturada, sem sintaxe de máquina.

---

## 12. Critérios de rejeição

A spec — ou qualquer resolução verificada por ela — é **rejeitada** se:

1. Usa a numeração de princípio como critério de prioridade.
2. Resolve um conflito inseguro sem escalada (violação silenciosa).
3. Atribui a decisão ao LLM, agente, prompt ou runtime.
4. Sacrifica Verdade operacional, Segurança ou Isolamento multi-tenant por um valor de menor
   prioridade.
5. Produz resolução não-reconstruível ou sem evidência auditável.
6. Introduz código, API, schema, YAML/JSON, DSL ou contrato machine-readable.
7. Resume/duplica/inventa doutrina em vez de referenciar a fonte canônica.
8. Reposiciona o YZI OS como chatbot, SaaS genérico, automação simples ou wrapper de LLM.

---

## 13. Relação com as camadas do YZI OS

A arbitragem é exercida pela camada de **governança/services** (autoridade institucional), nunca
pelas camadas sem autoridade (Agents/Tools/LLM/Runtime). A escalada transfere a decisão para fora do
sistema (operador humano), preservando a escada de autoridade de
[`layer-authority-model`](./layer-authority-model.spec.md).

---

## 14. Relação com specifications futuras

Toda spec futura que envolva decisão sob tensão (governança, execução, retrieval, tenant, harness)
**DEVE** aplicar este procedimento. Em particular: `escalation-policy`, `operational-boundaries`,
`policy-enforcement` e os harnesses de governança/escalação herdam esta arbitragem. Nenhuma spec pode
definir um critério de prioridade próprio que contradiga a ordem de valores.

---

## 15. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Papel na resolução de conflito |
| --- | --- |
| **Skill** | pode **detectar** tensão (ex.: `escalation-trigger`), nunca **decidir** o conflito |
| **Subagente** | propõe/sinaliza; o `escalation-subagent` aciona a escalada, sem decidir o mérito |
| **Harness** | o `governance-harness` aplica a arbitragem determinística; o `escalation-harness` opera a escalada e registra |
| **Service** | exerce a arbitragem institucional dentro de contrato |
| **Tool** | executa apenas a resolução já decidida, sob permissão e trace |
| **LLM / agente de código** | nunca decide o conflito; pode apenas descrever opções como Metadata |

---

## 16. Método de verificação

1. Para cada resolução registrada, reconstruir os **valores em tensão**, as **opções** e o **valor
   preservado**, e verificar que a escolha respeita a ordem da §7.
2. Verificar que a numeração `P*` **não** foi usada como critério.
3. Verificar que conflitos inseguros geraram **escalada registrada**.
4. Verificar que a decisão **não** foi atribuída ao LLM/agente/prompt/runtime.
5. Violação ⇒ rejeição/escalada; a verificação é independente do agente e reconstruível.

---

## 17. Observabilidade esperada

- Registro, por conflito: valores em tensão · opções · valor de maior prioridade preservado ·
  justificativa pela ordem de valores · decisor (institucional ou humano escalado).
- Registro de toda escalada (motivo da insegurança, decisão humana, responsabilidade).
- Trilha auditável e read-only para o artefato que ela fiscaliza (`P9`, `DO6`, `DO7`).

---

## 18. Riscos arquiteturais evitados

- **Resolução por numeração** — tratar `P1` como mais importante que `P10` por ser menor.
- **Decisão atribuída ao modelo** — conflito resolvido por intuição do agente/prompt.
- **Violação silenciosa** — conflito inseguro absorvido sem escalada nem registro.
- **Inconsistência entre operações** — mesmo conflito resolvido de formas diferentes.
- **Sacrifício de valor superior** — preservar leveza/continuidade às custas de verdade/segurança/
  isolamento.

---

## 19. Fora de escopo

- **Não** redefine os princípios (isso é `core-operational-principles`) nem a escada de autoridade
  (isso é `layer-authority-model`).
- **Não** cria a spec `tenant-boundary` (Spec 4/4) nem qualquer outra.
- **Não** define o procedimento operacional detalhado de escalação (isso é `escalation-policy`) nem
  o registro de intervenção (isso é `intervention-log`) — apenas referencia.
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  YAML/JSON ou contrato machine-readable.

---

## 20. Proveniência

`[CE]` Context Engineering — confiar na arquitetura; trilha de auditoria orgânica. `[PYR]`
Context→Intent→Specification — sem proveniência não há auditoria; backend decide. `[HE-GOV]`
Harness Engineering / Governança — enforcement determinístico; escalada e fronteira de decisão.

---

## 21. Fronteiras (o que NÃO está aqui)

- **Não** substitui a regra de resolução de `principles.md`: é a spec que a **opera** como
  procedimento contratual verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura — apenas fixa o procedimento de arbitragem que todas herdam.
