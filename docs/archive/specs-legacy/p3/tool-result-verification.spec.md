# tool-result-verification

> **Specification documental (governança-first, observability-first, execution-aware, linguagem natural
> estruturada).** Quinta e **última** spec do **bloco Execution** e **fecha a Onda P3**. Define como o
> YZI OS **verifica o resultado de uma tool execution**: a etapa pós-execução que **compara efeito
> esperado, execução realizada, efeito observado e evidência** — porque **a tool execution não valida o
> próprio resultado**. Verificação **não é opinião do LLM** nem autodeclaração de agente/tool/runtime;
> **nenhum resultado é operacionalmente confiável sem verification**. **Não** é machine-readable: não
> contém YAML, JSON, schema, DSL, pseudo-código, contrato técnico executável, código, API, configuração
> nem plano de implementação.
>
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## 1. Identificação da spec

| Campo | Valor |
| --- | --- |
| **Nome** | `tool-result-verification` |
| **Arquivo** | `/docs/specs/p3/tool-result-verification.spec.md` |
| **Classe de operação** | verificação-de-resultado-de-execução |
| **Candidatura** | `harness` (`execution-harness` + `observability-harness` + `audit-harness`) + `verification-subagent` |
| **Proveniência** | `[HARNESS-RT]` `[PYR]` `[HE-GOV]` `[CE]` |

## 2. Status, camada, onda e owner arquitetural

| Campo | Valor |
| --- | --- |
| **Status** | proposta para aprovação · Versão v1 · Data 2026-06-04 |
| **Camada** | `observability` / `audit` (verificação pós-execução) |
| **Onda** | P3 (Execution + Observability) — bloco Execution (quinta, **fecha a Onda P3**) |
| **Owner arquitetural** | Observabilidade / Execution |
| **Tenant-scope** | Per-tenant |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P8`, `P9`, `DO6`, `DO9` (verificação como runtime; atribuição antes de nova ação), `DO5`.
- [`/docs/specification-engineering/execution-contracts.md`](../../specification-engineering/execution-contracts.md) §3 — verificação vinculada à execução; requisitos↔evidência determinística; reproduzir→atribuir→corrigir→verificar→reportar.
- [`/docs/harness-engineering/execution-harness.md`](../../harness-engineering/execution-harness.md) §3 e [`/docs/runtime/runtime-execution-model.md`](../../runtime/runtime-execution-model.md) §5 — verificação acionada, não julgada; critério pertence à governança.
- [`/docs/specs/p3/verification-report.spec.md`](verification-report.spec.md) e [`/docs/specs/p3/tool-execution.spec.md`](tool-execution.spec.md) — objeto evidenciário; a execução exige verificação posterior.

---

## 3. Propósito

Fixar, como **contrato operacional verificável**, **como o YZI OS verifica o resultado de uma tool
execution**. A tool execution **realiza o efeito**, mas **não valida o próprio resultado**: a **tool
result verification** é a etapa **posterior** que **compara o efeito esperado, a execução realizada, o
efeito observado e a evidência produzida**, classificando o resultado por evidência determinística. A
verificação **não é opinião do LLM** nem autodeclaração de agente, tool ou runtime; o runtime **aciona**,
mas o **critério** de verdade pertence à governança. **Nenhum resultado de tool pode ser considerado
operacionalmente confiável sem verification.**

A spec **extrai** (não inventa nem resume) a verificação vinculada à execução e o objeto evidenciário.
**Fecha o bloco Execution e a Onda P3.**

---

## 4. Escopo

- Definir a tool result verification como etapa **pós-execução** (não autodeclaração) (§6, §7).
- Definir **o que a verificação compara** (§8), os **resultados possíveis** (§9) e a **evidência mínima**
  (§10).
- Definir as relações com execução, decisão/permissão/registro, estado/eventos, tenant, policies, e o
  bloco Observability.
- Definir a **recomendação de revisão** (sem correção automática) (§21) e **quando bloquear, pendenciar
  evidência ou escalar** (§25).

## 5. Fora de escopo

- **Não** executa nem re-executa a tool (não é nova execução), **não** decide (service), **não** autoriza
  (permission), **não** registra (registry).
- **Não** **corrige** automaticamente resultado inválido nem **altera estado** por si só.
- **Não** cria tool, service, skill, subagente, harness executável, código, API, schema, frontend,
  backlog, sprint plan, YAML/JSON, contrato machine-readable ou implementation harness; **não** infere
  stack; **não** cria specs P4; **não** reposiciona o YZI OS.

---

## 6. Definição de tool result verification

**Tool result verification** é a etapa **posterior à execução** que **verifica o resultado** de uma tool
execution por **evidência determinística**. Características:

1. **Pós-execução:** ocorre **depois** da tool execution; a **execução não valida o próprio resultado**.
2. **Comparativa:** confronta **efeito esperado × execução realizada × efeito observado × evidência**
   (§8).
3. **Por evidência, não por declaração:** **não é opinião do LLM** nem autodeclaração de agente/tool/
   runtime; resultado verificado **exige evidência mínima suficiente**.
4. **Condição de confiabilidade:** **nenhum resultado de tool é operacionalmente confiável sem
   verification** (§22).
5. **Não destrutiva:** não altera estado nem corrige automaticamente (§13, §21).

---

## 7. Verificação como etapa pós-execução, não autodeclaração

1. **A tool execution não valida o próprio resultado**; a verificação é uma etapa **distinta e
   posterior**, e **não é uma nova execução**.
2. A verificação **não é** service decision, **não é** tool permission.
3. A verificação **não é opinião do LLM**, nem **autodeclaração do agente, da tool ou do runtime**.
4. **LLM, agente, prompt, runtime ou tool NÃO PODEM declarar um resultado como verificado sem evidência.**
5. O **runtime pode coordenar** a verificação, mas **não decide sozinho a verdade do resultado** — o
   critério pertence à governança (`DO9`), com **auditor independente** (quem executou não verifica).

---

## 8. O que a verificação compara

A verificação **DEVE** comparar, no mínimo:

- **efeito esperado** · **execução realizada** · **efeito observado**;
- **evidência disponível** · **evidência ausente**;
- **service decision relacionada** · **permission relacionada**;
- **tenant scope** · **operational boundaries** · **authority layer**;
- **estado/evento produzido ou bloqueado**;
- **trace / audit log**.

A comparação é **reconstruível** a partir de [`episode-trace`](episode-trace.spec.md) e
[`audit-log`](audit-log.spec.md); **nunca** se inventa evidência.

---

## 9. Resultados possíveis da verificação

| Resultado | Significado |
| --- | --- |
| **Verificado** | efeito esperado confirmado por evidência mínima suficiente |
| **Não verificado** | sem evidência suficiente — **não** pode ser tratado como sucesso |
| **Pendente de evidência** | falta evidência que ainda pode existir; aguarda |
| **Inconsistente** | efeito observado conflita com o esperado/evidência → gera failure attribution (§18) |
| **Escalado** | excede a fronteira automática; segue para o operador (registrado) |

**Resultado ambíguo** ⇒ pendência de evidência ou escalada. **Resultado sem evidência suficiente não é
sucesso.**

---

## 10. Evidência mínima, ausência e proveniência

1. **Resultado verificado exige evidência mínima suficiente** (determinística).
2. **Ausência, conflito, fragilidade ou corrupção de evidência** **DEVE** gerar **não verificado,
   pendência de evidência ou escalada** — nunca "verificado".
3. A verificação **preserva provenance e evidência** (`DO6`): não apaga, não altera, não fabrica.

---

## 11. Relação com tool-execution

A verificação **ocorre depois** da [`tool-execution`](tool-execution.spec.md) e **fecha** a cadeia
registro → decisão → permissão → execução → **verificação**. A execução produz **efeito observado** e
**resultado inicial**; a verificação os **confronta** com o efeito esperado e a evidência. A execução
**não** se autovalida.

## 12. Relação com service-contract, tool-permission e tool-registry

A verificação **não é** service decision ([`service-contract`](service-contract.spec.md)), **não é** tool
permission ([`tool-permission`](tool-permission.spec.md)) e pressupõe tool **registrada**
([`tool-registry`](tool-registry.spec.md)). Ela **comprova**; não decide, não autoriza, não registra a
tool.

## 13. Relação com estado e eventos

A verificação **não altera estado por si só** ([`operational-state`](../p1/operational-state.spec.md)) e
**não corrige automaticamente** resultado inválido. Ela **lê** o estado/evento produzido ou bloqueado
([`event-driven-state`](../p1/event-driven-state.spec.md)) como evidência; seu próprio registro é
auditável e não destrutivo.

## 14. Relação com tenant scope

A verificação **preserva tenant scope e tenant boundary** ([`tenant-boundary`](../p0/tenant-boundary.spec.md),
[`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md)). **Resultado que viola tenant boundary
DEVE ser bloqueado, registrado e escalado** — nunca aceito.

## 15. Relação com policies e boundaries

**Resultado que viola policy, operational boundary ou authority layer DEVE ser bloqueado, registrado e
escalado** ([`policy-enforcement`](../p2/policy-enforcement.spec.md), [`operational-boundaries`](../p2/operational-boundaries.spec.md)).
O **critério** de aprovação pertence à governança, não ao executor.

## 16. Relação com episode-trace e audit-log

A verificação **DEVE alimentar** [`episode-trace`](episode-trace.spec.md) e [`audit-log`](audit-log.spec.md):
o que foi comparado, com qual evidência, qual resultado, qual tenant e qual camada responsável — de forma
proveniente e tenant-scoped.

## 17. Relação com verification-report

A verificação **alimenta** o [`verification-report`](verification-report.spec.md): é a aplicação, ao
**resultado de uma tool execution**, do objeto evidenciário requisitos↔evidência. O report consolida; a
tool-result-verification fornece a verificação da etapa de execução.

## 18. Relação com failure-attribution

**Resultado inconsistente** e **falha de resultado** **DEVEM** ser **atribuíveis** por
[`failure-attribution`](failure-attribution.spec.md): a atribuição explica onde/por que, **antes** de
qualquer correção, sem culpa genérica.

## 19. Relação com entropy-audit

**Entropia causada pelo resultado** (deriva, resíduo, enfraquecimento de verificação) **DEVE** ser
**auditável** por [`entropy-audit`](entropy-audit.spec.md), tratada dentro do laço (`DO10`).

## 20. Relação com intervention-log

**Intervenção relacionada ao resultado** **DEVE** ser **registrada** por
[`intervention-log`](intervention-log.spec.md) como sinal diagnóstico, não como falha escondida.

---

## 21. Recomendação de revisão (sem correção automática)

A verificação **pode recomendar revisão** de **service contract, tool registry, tool permission, tool
execution, policy, boundary, tenant config ou operação humana** — mas **NÃO corrige automaticamente** o
resultado inválido nem altera estado. A correção é decidida **fora** da verificação, pelas camadas com
autoridade.

## 22. Confiabilidade operacional exige verificação

**Nenhum resultado de tool pode ser considerado operacionalmente confiável sem verification.** Um
resultado **não verificado** ou **pendente** **não** é sucesso; um resultado **inconsistente** é insumo
de atribuição de falha. A confiabilidade é propriedade da **evidência verificada**, não da execução em si.

---

## 23. Critérios de aceite

1. Define a verificação como etapa **pós-execução** que compara efeito esperado/execução/efeito observado/
   evidência (§6, §8); a execução não se autovalida.
2. Não é nova execução, decisão, permissão, opinião do LLM nem autodeclaração de agente/tool/runtime
   (§7); ninguém declara verificado sem evidência.
3. Fixa os resultados possíveis (§9) e a regra de evidência mínima/ausência/proveniência (§10).
4. Bloqueia/registra/escala resultado que viola tenant boundary, policy, operational boundary ou
   authority layer (§14, §15).
5. Alimenta trace/log/verification-report; resultado inconsistente → failure attribution; entropia →
   entropy audit; intervenção → intervention log (§16–§20).
6. Não altera estado nem corrige automaticamente; recomenda revisão; **nenhum resultado é confiável sem
   verification**; revisável por humano (§13, §21, §22).

## 24. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Deixa a tool execution validar o próprio resultado, ou trata a verificação como nova execução.
2. Aceita resultado verificado por **opinião/autodeclaração** (LLM/agente/tool/runtime) sem evidência.
3. Trata resultado sem evidência suficiente como sucesso, ou inventa/apaga/altera evidência.
4. Não classifica em verificado/não verificado/pendente/inconsistente/escalado, ou não gera failure
   attribution para inconsistente.
5. Aceita resultado que viola tenant boundary/policy/operational boundary/authority layer.
6. Não alimenta trace/log/verification-report; ou faz o runtime decidir sozinho a verdade do resultado.
7. Altera estado, corrige automaticamente, ou é destrutiva.
8. Introduz código/API/schema/YAML/JSON/contrato machine-readable; infere stack; cria spec P4; ou
   reposiciona o YZI OS.

---

## 25. Quando bloquear, pendenciar evidência ou escalar

1. **Bloquear, registrar e escalar** resultado que **viola tenant boundary, policy, operational boundary
   ou authority layer**.
2. **Não verificado / pendência de evidência / escalada** quando houver **ausência, conflito, fragilidade
   ou corrupção de evidência**, ou resultado **ambíguo**.
3. **Inconsistente** ⇒ gera **failure attribution** e segue para correção governada (fora desta etapa).

## 26. Riscos arquiteturais evitados

- **Autovalidação da execução** — tool declarando o próprio resultado como bom.
- **Sucesso sem evidência** — tratar resultado não verificado como êxito.
- **Verificação por opinião** — LLM/agente/tool/runtime declarando verificado sem evidência.
- **Resultado fora de fronteira aceito** — violar tenant/policy/boundary/authority sem bloqueio.
- **Verificação destrutiva / corretiva** — alterar estado ou corrigir ao verificar.
- **Confiabilidade presumida** — confiar em resultado sem verification.

## 27. Dependências

[`tool-execution`](tool-execution.spec.md), [`tool-permission`](tool-permission.spec.md),
[`service-contract`](service-contract.spec.md), [`tool-registry`](tool-registry.spec.md),
[`operational-state`](../p1/operational-state.spec.md), [`event-driven-state`](../p1/event-driven-state.spec.md),
[`tenant-boundary`](../p0/tenant-boundary.spec.md), [`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md),
[`layer-authority-model`](../p0/layer-authority-model.spec.md), [`policy-enforcement`](../p2/policy-enforcement.spec.md),
[`operational-boundaries`](../p2/operational-boundaries.spec.md), [`escalation-policy`](../p2/escalation-policy.spec.md),
[`episode-trace`](episode-trace.spec.md), [`audit-log`](audit-log.spec.md),
[`verification-report`](verification-report.spec.md), [`failure-attribution`](failure-attribution.spec.md),
[`entropy-audit`](entropy-audit.spec.md), [`intervention-log`](intervention-log.spec.md).

## 28. Próxima fronteira recomendada

Com `tool-result-verification`, **o bloco Execution e a Onda P3 fecham**. A próxima fronteira recomendada
é a **Onda P4** do Specification Map (a definir) — ver
[Specification Map](../../specification-engineering/specification-map.md) e
[Controlled Execution Plan](../../implementation/controlled-execution-plan.md). **Recomendação, não
autorização.** Esta spec **não** inicia P4.

## 29. Checkpoint

Spec única criada: `/docs/specs/p3/tool-result-verification.spec.md`. Documental, governance-first,
observability-first, execution-aware, em linguagem natural estruturada. **Fecha o bloco Execution e a
Onda P3.** Não cria nenhuma outra spec (incl. P4), tool, service, skill, subagente, harness, código, API,
schema, YAML/JSON nem contrato machine-readable. Conformidade com `P8`/`P9`/`DO6`/`DO9` e com a ordem de
valores (verdade operacional 1ª; segurança 2ª; isolamento 3ª; auditabilidade 4ª). Aguarda revisão e
aprovação humana.

---

## Proveniência

`[HARNESS-RT]` AI Harness Runtime — verificação vinculada à execução; verificação acionada, não julgada;
conclusão como objeto evidenciário. `[PYR]` Context→Intent→Specification — requisitos↔evidência;
contract-first. `[HE-GOV]` Harness Engineering / Governança — critério pertence à governança; resultado
fora de fronteira bloqueado. `[CE]` Context Engineering — auditor independente; proveniência; trilha
orgânica.

## Fronteiras (o que NÃO está aqui)

- **Não** substitui `DO9` nem a verificação como capacidade operacional: é a spec que os **opera** como
  contrato de verificação de resultado de tool verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza a Onda P4 nem nenhuma spec futura — apenas fixa a verificação de resultado que **fecha
  a Onda P3**.
