# verification-report

> **Specification documental (governança-first, observability-first, linguagem natural estruturada).**
> Quarta spec da **Onda P3 (Execution + Observability)**. Define o **verification report** do YZI OS: o
> **objeto evidenciário** que estabelece se uma operação satisfez seus requisitos — mapeando
> **requisitos ↔ evidência determinística**, checando comportamento preservado e reportando evidência e
> limitações. A verificação é **responsabilidade do sistema** (`DO9`), não asserção do modelo: ninguém
> autodeclara conformidade. **Não** é machine-readable: não contém YAML, JSON, schema, DSL,
> pseudo-código, contrato técnico executável, código, API, configuração nem plano de implementação.
>
> Onda: P3 (execução + observabilidade) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `verification-report` |
| **Camada** | `observability` / `audit` |
| **Owner arquitetural** | Observabilidade / Governança |
| **Tenant-scope** | Per-tenant |
| **Classe de operação** | verificação / objeto-evidenciário |
| **Candidatura** | `harness` (`observability-harness` + `audit-harness`) + `verification-subagent` |
| **Dependências** | [`episode-trace`](episode-trace.spec.md), [`audit-log`](audit-log.spec.md), [`failure-attribution`](failure-attribution.spec.md), [`policy-enforcement`](../p2/policy-enforcement.spec.md), [`operational-state`](../p1/operational-state.spec.md), [`escalation-policy`](../p2/escalation-policy.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md), [`layer-authority-model`](../p0/layer-authority-model.spec.md) |
| **Proveniência** | `[HARNESS-RT]` `[CE]` `[PYR]` `[AHE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P8`, `P9`, `DO6`, `DO9` (verificação como runtime).
- [`/docs/architecture/operational-architecture.md`](../../architecture/operational-architecture.md) §5 — verificação é responsabilidade do sistema; conclusão é objeto evidenciário; reproduzir→atribuir→corrigir→verificar→reportar; separa comportamento de qualidade da evidência.
- [`/docs/architecture/observability-architecture.md`](../../architecture/observability-architecture.md) §3 — relatório de verificação (requisitos ↔ evidência) no pacote de episódio.
- [`/docs/harness-engineering/audit-harness.md`](../../harness-engineering/audit-harness.md) — auditor independente; trilha orgânica.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, o que é o **verification report**: o **objeto
evidenciário** que estabelece se uma operação **satisfez seus requisitos**, mapeando **requisitos ↔
evidência determinística**, checando **comportamento preservado** e reportando **evidência e
limitações**. No YZI OS, **verificação é responsabilidade do sistema, não do humano** (`DO9`): a
conclusão de uma operação **não** é uma asserção ("está pronto") — é um objeto verificável.

A spec **extrai** (não inventa nem resume) a verificação como capacidade operacional e o relatório de
verificação do pacote de episódio. É a quarta spec da Onda P3 e apoia audit log, failure attribution,
entropy audit, intervention log e melhoria futura.

---

## 2. Problema que resolve

Se a conclusão de uma operação fosse uma **autodeclaração** ("está pronto") do LLM/agente, a conformidade
seria probabilística, dependente da memória do modelo e não auditável. Validar sem evidência, ou inventar
evidência para "fechar", produz falsa garantia.

Esta spec elimina o risco fixando a verificação como **objeto evidenciário determinístico**: requisitos
mapeados a verificações, evidência mínima exigida, limitações reportadas — e **ausência/conflito/
fragilidade de evidência gera falha, pendência ou escalada**, nunca validação.

---

## 3. Autoridade envolvida

- **Produz o report:** a **Observabilidade** e o `verification-subagent`, sob policies — com **auditor
  independente** (quem executou **não** verifica a própria operação, `[CE]`).
- **Coordena (não decide sozinho a conformidade):** o **Runtime** pode coordenar a geração do report,
  mas **não decide sozinho** se a operação está conforme.
- **NÃO autodeclaram conformidade:** **LLM, agente e prompt** não declaram a própria operação conforme;
  o report **não depende da memória do LLM** (`P1`, `P12`).

---

## 4. Entradas esperadas

- Os **requisitos** da operação (segundo spec/contrato aplicável) e o **comportamento esperado**.
- O [`episode-trace`](episode-trace.spec.md) e o [`audit-log`](audit-log.spec.md) do episódio, com
  proveniência e tenant.
- A **evidência** determinística disponível para cada requisito.

## 5. Saídas esperadas

- Um **verification report** — objeto evidenciário que mapeia requisitos ↔ evidência, checa comportamento
  preservado, reporta limitações e **classifica o resultado** (§8), tenant-scoped e auditável.
- Quando faltar evidência: uma **falha de verificação, pendência de evidência ou escalada** registrada.

---

## 6. Definição de verification report

**Verification report** é o **objeto evidenciário** que estabelece, de forma auditável, se uma operação
satisfez seus requisitos. Características:

1. **Requisitos ↔ evidência:** cada requisito é mapeado a uma **verificação determinística** e à
   **evidência** que a sustenta.
2. **Comportamento preservado:** checa que o comportamento institucional esperado foi mantido.
3. **Evidência e limitações reportadas:** reporta o que foi verificado **e** o que não foi (limitações).
4. **Não é asserção:** não é "está pronto" dito pelo modelo; é objeto verificável (`DO9`).
5. **Auditável, revisável e não destrutivo:** reconstruível, revisável por humano, sem apagar/alterar
   evidência ou estado.

---

## 7. Anatomia mínima do verification report

Todo verification report **DEVE** registrar:

| Elemento | O que registra |
| --- | --- |
| **Requisitos** | os requisitos da operação (segundo spec/contrato) |
| **Verificações** | a verificação determinística mapeada a cada requisito |
| **Evidência** | a evidência que sustenta cada verificação (reconstruível via trace/log) |
| **Comportamento preservado** | a checagem de que o comportamento esperado foi mantido |
| **Limitações** | o que não foi verificado e por quê |
| **Classificação do resultado** | o veredito (§8), separando comportamento de qualidade da evidência |
| **Tenant / authority layer / proveniência** | escopo e origem do que foi verificado |

A evidência **DEVE** ser reconstruível a partir de [`episode-trace`](episode-trace.spec.md) e
[`audit-log`](audit-log.spec.md). **Nunca** se inventa evidência.

---

## 8. Classificação do resultado

O report **DEVE** classificar o resultado **separando comportamento da operação de qualidade da
evidência** (`[HARNESS-RT]`):

| Classificação | Significado |
| --- | --- |
| **Verificado** | requisitos satisfeitos, sustentados por evidência determinística suficiente |
| **Não verificado** | operação pode estar correta, porém **sem** evidência suficiente — não se valida |
| **Pendente de evidência** | falta evidência que ainda pode existir; aguarda até existir |
| **Falha verificada** | requisito não satisfeito; falha (diagnosticamente útil, ver [`failure-attribution`](failure-attribution.spec.md)) |

Uma operação **correta porém não verificada** não recebe selo de conformidade; uma **falha** pode ser
diagnosticamente útil.

---

## 9. Evidência mínima e ausência de evidência

1. O report **NÃO PODE validar operação sem evidência mínima**: sem evidência determinística suficiente,
   o resultado é **não verificado / pendente / falha**, nunca "verificado".
2. **Ausência, conflito ou fragilidade de evidência** **DEVE** gerar **falha de verificação, pendência de
   evidência ou escalada** ([`escalation-policy`](../p2/escalation-policy.spec.md)).
3. O report **NÃO PODE inventar evidência** nem depender da **memória conversacional do LLM**.

---

## 10. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Tratar a conclusão como **objeto evidenciário**, não asserção (`DO9`).
2. Mapear requisitos ↔ evidência determinística e checar comportamento preservado (§6, §7).
3. Reportar limitações; classificar o resultado separando comportamento de qualidade da evidência (§8).
4. Não validar sem evidência mínima; não inventar evidência; não depender da memória do LLM.
5. Tratar ausência/conflito/fragilidade de evidência por falha/pendência/escalada.
6. Manter o report **tenant-scoped**, com proveniência e authority layer; preservar a fronteira de tenant.
7. Preservar **auditor independente**: quem executou não verifica a própria operação.
8. Manter o runtime como coordenador (não decisor único da conformidade); impedir LLM/agente/prompt de
   autodeclarar conformidade.
9. Ser **auditável, revisável e não destrutivo**; **não alterar estado** e **não executar correção**.
10. Apoiar audit log, failure attribution, entropy audit, intervention log e melhoria futura.

---

## 11. Critérios de aceite

1. Referencia `P8`/`P9`/`DO9` e a verificação como capacidade operacional sem contradizê-los nem
   duplicá-los.
2. Define o report como objeto evidenciário requisitos↔evidência (§6, §7).
3. Fixa a classificação do resultado (§8) separando comportamento de qualidade da evidência.
4. Fixa evidência mínima, proibição de inventar evidência e independência da memória do LLM (§9).
5. Fixa ausência/conflito/fragilidade → falha/pendência/escalada; tenant scope/boundary; auditor
   independente.
6. É auditável, revisável, não destrutivo; não altera estado nem corrige; revisável por humano.

---

## 12. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Trata a conclusão como asserção/autodeclaração ("está pronto").
2. Valida operação sem evidência mínima, ou inventa evidência.
3. Depende da memória conversacional do LLM.
4. Permite LLM/agente/prompt autodeclarar conformidade, ou o runtime decidir sozinho a conformidade.
5. Não trata ausência/conflito/fragilidade de evidência por falha/pendência/escalada.
6. Cruza/expõe outro tenant, ou ignora authority layer/proveniência.
7. Altera estado, executa correção, é destrutivo ou não revisável; ou quem executou verifica a si mesmo.
8. Introduz código/API/schema/YAML/JSON/contrato machine-readable; infere stack; transforma em plano de
   implementação; ou reposiciona o YZI OS.

---

## 13. Relação com episode-trace e audit-log

A evidência do report é **reconstruível** a partir do [`episode-trace`](episode-trace.spec.md) (registro
mínimo do episódio) e do [`audit-log`](audit-log.spec.md) (trilha institucional). Sem trace/log
reconstruíveis, não há verificação possível: o resultado é não verificado/pendente/escalada. O report
entra no audit log de forma **não destrutiva**.

## 14. Relação com failure-attribution

Verificação e atribuição são complementares: o report **constata** que um requisito não foi satisfeito
(falha verificada); a [`failure-attribution`](failure-attribution.spec.md) **explica** onde/por quê. A
atribuição ocorre **antes** de qualquer correção; o report **não** corrige — apenas constata e classifica.

## 15. Relação com state e governance specs

O report **lê — não altera** — o estado ([`operational-state`](../p1/operational-state.spec.md)) e usa os
contratos de governança como **referência de requisito/comportamento esperado**
([`policy-enforcement`](../p2/policy-enforcement.spec.md), [`behavioral-governance`](../p2/behavioral-governance.spec.md),
[`operational-boundaries`](../p2/operational-boundaries.spec.md)). O enforcement determinístico é a base
da verificação pós-geração.

## 16. Relação com observabilidade e auditoria

O report é o **relatório de verificação** do pacote de episódio (observability-architecture §3) e parte
do **decision observability** (predição falsificável verificada contra o resultado, `DO7`). É
**read-only para o executor** e sustentado pelo `audit-harness`; alimenta a melhoria futura sem
substituir a auditoria.

## 17. Relação com futuras tools/services

Quando **existirem**, resultados de tools/services serão objeto de verificação (o
`tool-result-verification` futuro herda deste contrato). Esta spec **prepara** essa verificação **sem**
criar tool/service nem inferir execução.

---

## 18. Quando bloquear, pendenciar evidência ou escalar

1. **Falha de verificação** quando um requisito não é satisfeito (com evidência).
2. **Pendência de evidência** quando falta evidência que ainda pode existir.
3. **Escalada** quando há conflito/fragilidade de evidência não resolvível, ou quando a verificação exige
   autoridade humana. Nunca se valida para "fechar"; a ausência de evidência é registrada como fato.

---

## 19. Riscos arquiteturais evitados

- **Autodeclaração de conformidade** — "está pronto" sem evidência (`DO9`).
- **Evidência inventada** — validar sem suporte determinístico.
- **Conformidade dependente do modelo** — report apoiado na memória do LLM.
- **Validação sob evidência frágil** — selar conforme com evidência ausente/conflitante.
- **Verificação destrutiva** — alterar estado/evidência ou corrigir ao verificar.
- **Auto-verificação** — quem executou verificando a si mesmo.

---

## 20. Fora de escopo

- **Não** corrige a falha nem altera estado — apenas verifica e classifica.
- **Não** define entropy audit nem intervention log em detalhe — apenas os apoia.
- **Não** cria o `observability-harness`/`audit-harness`/`verification-subagent` executável nem nenhuma
  outra spec.
- **Não** cria tool, service, skill, subagente, harness, código, API, schema, frontend, backlog, sprint
  plan, YAML/JSON, contrato machine-readable ou implementation harness.

---

## 21. Proveniência

`[HARNESS-RT]` AI Harness Runtime — verificação como responsabilidade do sistema; conclusão como objeto
evidenciário; classificação que separa comportamento de evidência. `[CE]` Context Engineering — auditor
independente; trilha orgânica; proveniência. `[PYR]` Context→Intent→Specification — requisitos↔evidência;
contract-first. `[AHE]` Agentic Harness Engineering — decision observability (predição falsificável);
controlabilidade read-only.

---

## 22. Fronteiras (o que NÃO está aqui)

- **Não** substitui `DO9` nem a verificação como capacidade operacional: é a spec que os **opera** como
  contrato de relatório de verificação verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma spec futura da Onda P3 — apenas fixa o verification report que as demais
  herdam.
