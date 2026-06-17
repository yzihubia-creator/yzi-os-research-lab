# intervention-log

> **Specification documental (governança-first, observability-first, linguagem natural estruturada).**
> Sexta spec da **Onda P3** — **fecha o bloco Observability** antes do bloco Execution. Define o
> **intervention log** do YZI OS: o registro auditável de **intervenções humanas, institucionais ou
> operacionais**, tratadas como **sinal diagnóstico, mecanismo de governança e evidência operacional** —
> nunca como falha escondida. **Não** é machine-readable: não contém YAML, JSON, schema, DSL,
> pseudo-código, contrato técnico executável, código, API, configuração nem plano de implementação.
>
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## 1. Identificação da spec

| Campo | Valor |
| --- | --- |
| **Nome** | `intervention-log` |
| **Arquivo** | `/docs/specs/p3/intervention-log.spec.md` |
| **Classe de operação** | registro-de-intervenção / observabilidade |
| **Candidatura** | `harness` (`observability-harness` + `audit-harness`) |
| **Proveniência** | `[HARNESS-RT]` `[CE]` `[PYR]` `[AHE]` |

## 2. Status, camada, onda e owner arquitetural

| Campo | Valor |
| --- | --- |
| **Status** | proposta para aprovação · Versão v1 · Data 2026-06-03 |
| **Camada** | `observability` / `audit` |
| **Onda** | P3 (Execution + Observability) — bloco Observability (última) |
| **Owner arquitetural** | Observabilidade / Governança |
| **Tenant-scope** | Per-tenant |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P8`, `P9`, `DO6`, `DO10`.
- [`/docs/architecture/observability-architecture.md`](../../architecture/observability-architecture.md) §8 — intervenção humana como sinal diagnóstico; evitabilidade; fronteira de governança; lacuna a fechar.
- [`/docs/architecture/operational-architecture.md`](../../architecture/operational-architecture.md) §8 — intervenção como sinal de responsabilidade de governança ausente (déficit de contexto/observabilidade/atribuição).
- [`/docs/harness-engineering/audit-harness.md`](../../harness-engineering/audit-harness.md) — auditor independente; trilha orgânica.

---

## 3. Propósito

Fixar, como **contrato operacional verificável**, o que é o **intervention log**: o registro de **toda
intervenção humana, institucional ou operacional** em uma operação, tratada como **sinal diagnóstico,
mecanismo de governança e evidência operacional**. Uma intervenção **não é falha escondida do sistema**:
é o sinal mais preciso de uma **responsabilidade de governança ausente** — se um humano precisou indicar
qual contexto usar, há déficit de contexto; se precisou interpretar uma falha, há déficit de
observabilidade ou atribuição. O log permite entender **quando, por que, quem/qual autoridade** interveio,
**o que motivou**, **qual decisão** foi tomada, **qual evidência** a sustentou, **qual impacto** produziu
e **se exige revisão futura**.

A spec **extrai** (não inventa nem resume) a intervenção como sinal das arquiteturas de observabilidade e
operacional. **Fecha o bloco Observability** da Onda P3.

---

## 4. Escopo

- Definir o intervention log como evidência/sinal (não log decorativo) e o que ele registra.
- Definir os **tipos de intervenção** (origens) e a **evidência mínima**.
- Definir as relações com escalation, episode-trace, audit-log, verification-report, failure-attribution,
  entropy-audit, estado/eventos, tenant scope e responsabilidade institucional.
- Definir **quando pendenciar evidência ou escalar**.

## 5. Fora de escopo

- **Não** executa correção nem altera spec/policy/state/tool/service por si só — apenas registra e
  recomenda.
- **Não** define o modelo de melhoria contínua em detalhe — apenas o alimenta.
- **Não** cria o `observability-harness`/`audit-harness` executável nem nenhuma outra spec.
- **Não** cria tool, service, skill, subagente, harness, código, API, schema, frontend, backlog, sprint
  plan, YAML/JSON, contrato machine-readable ou implementation harness; **não** infere stack; **não**
  reposiciona o YZI OS.

---

## 6. Definição de intervention log

**Intervention log** é o registro auditável de **intervenções humanas, institucionais ou operacionais**,
tratadas como **sinal diagnóstico** e **mecanismo de governança**. Características:

1. **Não decorativo:** é evidência de governança, não log técnico para depuração casual.
2. **Não é falha escondida:** a intervenção é registrada como sinal, **nunca** dissimulada como "falha do
   sistema".
3. **Sinal de déficit:** cada intervenção evitável sinaliza uma responsabilidade de governança ausente —
   uma **lacuna a fechar**.
4. **Proveniente e tenant-scoped:** preserva proveniência, tenant scope e authority layer.
5. **Auditável, revisável e não destrutiva:** reconstruível, revisável por humano, sem apagar/alterar
   trace, audit log, verification report, failure attribution, entropy audit ou estado.

---

## 7. Intervention log como evidência operacional e sinal diagnóstico

1. A intervenção é **evidência operacional auditável** — entra no pacote de episódio (registro de
   intervenção, observability-architecture §3).
2. É **sinal diagnóstico**: localiza o déficit de governança que a tornou necessária; cada intervenção
   evitável aponta para uma **lacuna a fechar**, alimentando a melhoria futura.
3. É **mecanismo de governança**: uma intervenção pode **encerrar, pausar, escalar ou reabrir** um
   episódio — sempre registrada como evento auditável (§16).
4. **Não é fabricável pelo LLM** nem depende da memória conversacional; **preserva a responsabilidade
   institucional** de quem interveio.

---

## 8. Tipos de intervenção

Quanto à **natureza**, a intervenção pode ser **humana**, **institucional** ou **operacional**. Quanto à
**origem**, o log **DEVE** registrar se a intervenção ocorreu por:

| Origem | Sinal |
| --- | --- |
| **Escalada** | resposta a uma escalada governada ([`escalation-policy`](../p2/escalation-policy.spec.md)) |
| **Falha atribuída** | resposta a uma [`failure-attribution`](failure-attribution.spec.md) |
| **Entropia recorrente** | resposta a [`entropy-audit`](entropy-audit.spec.md) reincidente |
| **Evidência insuficiente** | decisão não verificável por falta de evidência |
| **Conflito de autoridade** | camadas disputando autoridade |
| **Policy gap** | regra ausente onde necessária |
| **Retrieval gap** | recuperação insuficiente/imprecisa |
| **Context gap** | contexto mal montado/insuficiente |
| **Tenant ambiguity** | escopo de tenant ambíguo |
| **Operator decision** | decisão legítima do operador |
| **Necessidade institucional** | exigência institucional explícita |

Intervenções **inevitáveis** (ex.: decisão legítima do operador após escalada) são registradas como tais,
sem serem tratadas como lacuna; intervenções **evitáveis** apontam para a revisão necessária (§21).

---

## 9. Evidência mínima de intervenção

Cada registro **DEVE** conter:

| Elemento | O que registra |
| --- | --- |
| **Episódio relacionado** | via [`episode-trace`](episode-trace.spec.md) |
| **Tenant** | a qual tenant pertence |
| **Motivo da intervenção** | por que houve intervenção |
| **Autoridade / operador** | quem interveio e sob qual autoridade |
| **Camada que solicitou/motivou** | qual camada gerou a necessidade |
| **Evidência disponível** | o que sustenta a intervenção |
| **Evidência ausente** | o que faltava |
| **Decisão tomada** | qual decisão foi tomada |
| **Impacto operacional** | o efeito produzido |
| **Resultado da intervenção** | o desfecho |
| **Se exige revisão futura** | que revisão a intervenção recomenda (§21) |

A evidência **DEVE** ser reconstruível via trace/log; **nunca** se inventa evidência. Quando a causa/
déficit não puder ser atribuído com segurança, registra-se **"déficit indeterminado com evidência
insuficiente"**, com pendência ou escalada.

---

## 10. Relação com escalation-policy

A escalation é **governança, não falha** ([`escalation-policy`](../p2/escalation-policy.spec.md)). Uma
intervenção pode ser a **resposta legítima** a uma escalada (inevitável) ou o sinal de um déficit que
**deveria** ter sido governado sem intervenção (evitável). O log distingue os dois e referencia a escalada
correspondente.

## 11. Relação com episode-trace

Toda intervenção é ancorada ao [`episode-trace`](episode-trace.spec.md) do episódio: o trace fornece o
contexto reconstruível (estado lido, contexto, decisões, camada responsável) que torna a intervenção
interpretável. Sem trace reconstruível, a avaliação é registrada como déficit indeterminado (§9).

## 12. Relação com audit-log

A intervenção entra no [`audit-log`](audit-log.spec.md) como registro **não destrutivo**, tenant-scoped e
proveniente. Ausência/inconsistência do audit log que impeça interpretar a intervenção gera pendência de
evidência ou escalada (§21).

## 13. Relação com verification-report

Uma intervenção frequentemente segue uma verificação **não satisfeita** ([`verification-report`](verification-report.spec.md)):
o report **constata** a não-conformidade; o intervention-log **registra a ação humana/institucional** que
respondeu e a lacuna de governança que a tornou necessária.

## 14. Relação com failure-attribution

A [`failure-attribution`](failure-attribution.spec.md) **explica** onde/por que a falha ocorreu; o
intervention-log registra a **intervenção** que respondeu — sem culpa genérica, preservando a
responsabilidade institucional e o auditor independente.

## 15. Relação com entropy-audit

A [`entropy-audit`](entropy-audit.spec.md) detecta degradação/deriva; uma intervenção pode responder a
entropia recorrente. O log registra essa origem e a indicação de revisão, fechando a lacuna que a entropia
sinalizou.

## 16. Relação com estado e eventos

A intervenção **NÃO altera estado por si só** ([`operational-state`](../p1/operational-state.spec.md)).
Quando a intervenção **encerra, pausa, escala ou reabre** um episódio, isso **DEVE** ser registrado como
**evento auditável** ([`event-driven-state`](../p1/event-driven-state.spec.md)) — a mudança evolui por
evento, não por mutação implícita. A intervenção **não apaga** trace/log/atribuição/report/entropia.

## 17. Relação com tenant scope

O intervention log é **tenant-scoped** e **preserva a fronteira de tenant** ([`tenant-boundary`](../p0/tenant-boundary.spec.md),
[`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md)): nenhuma intervenção mistura ou expõe
outro tenant; **tenant ambiguity** é, ela própria, uma origem registrável de intervenção (§8).

## 18. Relação com responsabilidade institucional

A intervenção **preserva a responsabilidade institucional**: a responsabilidade recai sobre a
instituição/operador que interveio, tornada **exercível** pelo registro — **não** diluída em um ator
abstrato. **LLM, agente e prompt não autodeclaram** intervenção válida; o **runtime coordena** o registro,
mas **não decide a verdade** da intervenção.

---

## 19. Critérios de aceite

1. Define o intervention log como evidência/sinal diagnóstico/mecanismo de governança (não decorativo,
   não falha escondida) (§6, §7).
2. Registra natureza (humana/institucional/operacional) e origem (§8) e a evidência mínima (§9).
3. Relaciona-se com escalation, episode-trace, audit-log, verification-report, failure-attribution,
   entropy-audit, estado/eventos, tenant scope e responsabilidade institucional (§§10–18).
4. Tenant-scoped; não fabricável pelo LLM; independente da memória conversacional; runtime coordena, não
   decide.
5. Não altera estado/spec/policy/tool por si só; registra encerrar/pausar/escalar/reabrir como evento
   auditável; não apaga evidência.
6. Auditável, revisável e não destrutiva; apoia melhoria futura sem implementação automática; revisável
   por humano.

## 20. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Trata o intervention log como log técnico decorativo, ou esconde a intervenção como falha do sistema.
2. Omite natureza/origem (§8) ou qualquer item da evidência mínima (§9).
3. É fabricável pelo LLM, depende da memória conversacional, ou permite autodeclaração de intervenção.
4. Atribui ao runtime a decisão sobre a verdade da intervenção.
5. Altera estado/spec/policy/tool por si só, ou registra encerrar/pausar/escalar/reabrir **sem** evento
   auditável.
6. Apaga/altera trace, audit log, failure attribution, verification report ou entropy audit.
7. Dilui a responsabilidade institucional, cruza/expõe outro tenant, ou é destrutiva/não revisável.
8. Transforma intervenção em implementação automática.
9. Introduz código/API/schema/YAML/JSON/contrato machine-readable; infere stack; ou reposiciona o YZI OS.

---

## 21. Quando pendenciar evidência ou escalar

1. **Pendenciar evidência** quando a interpretação da intervenção/do déficit depende de evidência
   inexistente (déficit indeterminado, §9), ou quando há **ausência/inconsistência/fragilidade** no
   intervention log.
2. **Escalar** quando a lacuna exigir autoridade humana ou **revisão futura de spec, policy, retrieval,
   contexto, agent boundary, tenant config, service/tool ou operação humana**.

A intervenção pode **recomendar** essas revisões; **não** as executa.

## 22. Riscos arquiteturais evitados

- **Intervenção escondida** — tratada como falha do sistema, sinal perdido.
- **Log decorativo** — registro sem valor de governança.
- **Implementação automática** — transformar intervenção em ação sem governança.
- **Responsabilidade diluída** — intervenção sem autoria/autoridade registrada.
- **Mudança implícita** — encerrar/pausar/escalar/reabrir sem evento auditável.
- **Log destrutivo/fabricado** — apagar evidência, ou log produzido pelo LLM/conversa.

## 23. Dependências

[`episode-trace`](episode-trace.spec.md), [`audit-log`](audit-log.spec.md),
[`verification-report`](verification-report.spec.md), [`failure-attribution`](failure-attribution.spec.md),
[`entropy-audit`](entropy-audit.spec.md), [`escalation-policy`](../p2/escalation-policy.spec.md),
[`operational-state`](../p1/operational-state.spec.md), [`event-driven-state`](../p1/event-driven-state.spec.md),
[`tenant-boundary`](../p0/tenant-boundary.spec.md), [`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md),
[`layer-authority-model`](../p0/layer-authority-model.spec.md).

## 24. Próxima spec recomendada

Bloco **Execution** da Onda P3 — `service-contract`, depois `tool-registry`, `tool-permission`,
`tool-execution`, `tool-result-verification` — ver
[Specification Map](../../specification-engineering/specification-map.md). **Recomendação, não
autorização.** Esta spec **não** inicia `service-contract`.

## 25. Checkpoint

Spec única criada: `/docs/specs/p3/intervention-log.spec.md`. Documental, governance-first,
observability-first, em linguagem natural estruturada. **Fecha o bloco Observability** da Onda P3. Não
cria nenhuma outra spec, tool, service, skill, subagente, harness, código, API, schema, YAML/JSON nem
contrato machine-readable. Conformidade com `P8`/`P9`/`DO6`/`DO10` e com a ordem de valores
(auditabilidade, 4ª posição). Aguarda revisão e aprovação humana.

---

## Proveniência

`[HARNESS-RT]` AI Harness Runtime — intervenção humana como sinal diagnóstico; déficit de governança;
lacuna a fechar; registro de intervenção no pacote de episódio. `[CE]` Context Engineering — auditor
independente; trilha orgânica; proveniência. `[PYR]` Context→Intent→Specification — responsabilidade
institucional à origem. `[AHE]` Agentic Harness Engineering — controlabilidade read-only; intervenção
evitável como dimensão de observabilidade.

## Fronteiras (o que NÃO está aqui)

- **Não** substitui `P8`/`P9` nem a arquitetura de observabilidade: é a spec que os **opera** como
  contrato de registro de intervenção verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza o bloco Execution nem nenhuma spec futura — apenas fixa o intervention log que as
  demais herdam.
