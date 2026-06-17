# escalation-policy

> **Specification documental (governança-first, linguagem natural estruturada).** Spec da Onda P2
> (Governance). Define a **escalada como mecanismo de governança — não como falha**: quando o sistema
> não pode prosseguir com segurança, evidência, permissão, contexto suficiente ou conformidade, a
> saída correta é **escalada registrada** ao operador humano/institucional, preservando
> responsabilidade. **Não** é machine-readable: não contém YAML, JSON, schema, DSL, pseudo-código nem
> contrato técnico executável.
>
> Onda: P2 (governança + contexto) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `escalation-policy` |
| **Camada** | `governance` |
| **Owner arquitetural** | Governança |
| **Tenant-scope** | Global/instância (definição global, instância por tenant) |
| **Classe de operação** | escalação |
| **Candidatura** | `harness` (`escalation-harness`) |
| **Dependências** | [`operational-boundaries`](./operational-boundaries.spec.md), [`conflict-resolution`](../p0/conflict-resolution.spec.md), [`policy-enforcement`](./policy-enforcement.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md) |
| **Proveniência** | `[PYR]` `[HE-GOV]` `[CE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P9` (auditabilidade), `P7` (agente é interface), `P12`.
- [`/docs/foundation/philosophy.md`](../../foundation/philosophy.md) §5–§6 — verificação como runtime; responsabilidade e independência do auditor.
- [`/docs/specs/p2/operational-boundaries.spec.md`](./operational-boundaries.spec.md) e [`conflict-resolution`](../p0/conflict-resolution.spec.md) — fronteiras e ordem de valores.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, **quando e como o sistema escala** ao operador
humano/institucional. A escalada é a **saída correta** quando o sistema **não pode continuar com
segurança, evidência, autorização, contexto suficiente ou conformidade**. Ultrapassada a fronteira de
decisão automática, escala-se ao operador, **preservando a responsabilidade** — nenhuma operação fora
de fronteira é silenciosamente absorvida.

A spec **extrai** (não inventa nem resume) `P9`/`P7` e a filosofia de verificação/responsabilidade,
complementando [`operational-boundaries`](./operational-boundaries.spec.md) (que define as fronteiras)
e [`conflict-resolution`](../p0/conflict-resolution.spec.md) (que define a escalada como saída de
impasse seguro).

---

## 2. Problema que resolve

Sistemas que tratam o limite da própria competência como **falha** tendem a "improvisar" — inventar
autoridade, contornar policy ou prosseguir sem evidência. Sem uma política de escalada, a incerteza
vira risco silencioso.

Esta spec elimina o risco fixando a escalada como **mecanismo de governança de primeira classe**: uma
saída legítima, registrada e auditável, que preserva a responsabilidade humana onde o sistema não pode
decidir com segurança.

---

## 3. Autoridade envolvida

- **Decide a operação escalada:** o **operador humano/institucional** (fora do sistema automático).
- **Detecta e aciona a escalada:** Governança/Services e os harnesses (`escalation-harness`); a skill
  `escalation-trigger` e o `escalation-subagent` **sinalizam**, não decidem.
- **NUNCA decidem a exceção:** o LLM, o agente, o prompt e o runtime — não resolvem a escalada por
  inferência nem a suprimem (`P1`, `P7`).

---

## 4. Entradas esperadas

- A operação em curso e sua avaliação de fronteira/enforcement (de `operational-boundaries`/
  `policy-enforcement`), com tenant e contexto.
- Os sinais de gatilho (§8): ausência de evidência, ambiguidade de tenant, conflito não resolvido etc.

## 5. Saídas esperadas

- Uma **escalada registrada** ao operador humano/institucional, com motivo, contexto e responsabilidade
  preservada; **ou**
- O retorno à operação normal quando a condição de escalada não se aplica.

---

## 6. Contrato esperado (linguagem natural)

1. A **escalada é mecanismo de governança, NÃO falha**.
2. A escalada **DEVE** ocorrer quando o sistema **não puder prosseguir com segurança, evidência,
   permissão, contexto suficiente ou conformidade**.
3. A escalada **DEVE** ocorrer em qualquer dos gatilhos da §8.
4. Toda escalada **DEVE** ser **registrada e auditável**, preservando a **responsabilidade** do
   operador humano/institucional.
5. A escalada **NUNCA DEVE** ser decidida, suprimida ou substituída por LLM, agente, prompt ou runtime.
6. Nenhuma operação fora de fronteira **DEVE** ser silenciosamente absorvida (sempre escala/registra).
7. A escalada respeita a **ordem de valores** de
   [`conflict-resolution`](../p0/conflict-resolution.spec.md) (segurança, isolamento e auditabilidade
   acima de conveniência).

---

## 7. Escalada como mecanismo de governança (não falha)

Escalar **não** é o sistema "errar": é o sistema **reconhecer corretamente o limite da decisão
automática** e transferir a responsabilidade a quem a detém. É a contraparte de governança da
verificação como runtime: melhor **parar e escalar** do que prosseguir sem garantia. A escalada
preserva a controlabilidade — o operador humano permanece no laço onde o sistema não pode decidir com
segurança.

---

## 8. Gatilhos de escalada

A escalada **DEVE** ocorrer quando houver:

1. **Tenant scope** ausente, ambíguo ou conflitante.
2. **Policy enforcement** pendente ou bloqueado.
3. **Ausência de evidência** suficiente.
4. **Conflito não resolvido** por [`conflict-resolution`](../p0/conflict-resolution.spec.md).
5. **Tentativa de bypass** de policy, tenant boundary, auditabilidade ou authority layer.
6. **Risco de ação fora da fronteira operacional**.
7. **Risco de violação de segurança**.
8. **Risco de perda de auditabilidade**.
9. **Incerteza sobre a autoridade decisória**.
10. **Necessidade de decisão humana/institucional**.

Qualquer um basta. Na presença de gatilho, prosseguir automaticamente é não-conforme.

---

## 9. Registro e responsabilidade

1. Toda escalada gera **registro auditável**: motivo (gatilho), contexto, tenant, momento e o que foi
   transferido (alinha-se ao futuro `intervention-log`).
2. A **responsabilidade** pela decisão escalada é do **operador humano/institucional** e é preservada
   no registro.
3. O sistema **não** converte a decisão escalada em verdade operacional sem o retorno do operador e a
   validação contra estado/policies.
4. A trilha de escalada é **read-only** para quem foi escalado por ela (independência do auditor).

---

## 10. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Tratar a escalada como mecanismo de governança, não falha.
2. Escalar diante de qualquer gatilho (§8) e quando faltar segurança/evidência/permissão/contexto/
   conformidade.
3. Registrar toda escalada de forma auditável, preservando responsabilidade (`P9`, `DO6`).
4. Impedir LLM/agente/prompt/runtime de decidir, suprimir ou substituir a escalada.
5. Nunca absorver silenciosamente operação fora de fronteira.
6. Respeitar a ordem de valores na decisão de escalar.
7. Manter o operador humano como autoridade da decisão escalada.

---

## 11. Critérios de aceite

1. Referencia `P9`/`P7` e a filosofia de responsabilidade sem contradizê-las nem duplicá-las.
2. Fixa a escalada como mecanismo de governança (§7) e enumera os gatilhos (§8).
3. Fixa registro auditável e preservação de responsabilidade (§9).
4. Proíbe LLM/agente/prompt/runtime de decidir/suprimir a escalada.
5. Garante que nada fora de fronteira é absorvido silenciosamente.
6. Complementa `operational-boundaries` e `conflict-resolution`; é revisável por humano.

---

## 12. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Trata a escalada como falha a ser evitada/ocultada.
2. Prossegue automaticamente diante de um gatilho da §8.
3. Não registra a escalada ou não preserva a responsabilidade do operador.
4. Permite LLM/agente/prompt/runtime decidir, suprimir ou substituir a escalada.
5. Absorve silenciosamente operação fora de fronteira.
6. Converte decisão escalada em verdade sem validação contra estado/policies.
7. Introduz código/API/schema/YAML/JSON/contrato machine-readable; ou reposiciona o YZI OS.

---

## 13. Relação com as camadas do YZI OS

A escalada é acionada pela Governança e operada pelo `escalation-harness`; transfere a decisão para
**fora** das camadas automáticas (operador humano), preservando a escada de
[`layer-authority-model`](../p0/layer-authority-model.spec.md). O runtime aciona sem decidir; Agents/
LLM apenas sinalizam.

---

## 14. Relação com specifications futuras

Depende de [`operational-boundaries`](./operational-boundaries.spec.md) (define as fronteiras cujo
exceder dispara escalada) e de [`conflict-resolution`](../p0/conflict-resolution.spec.md) (escalada
como saída de impasse seguro). Sustenta o futuro `intervention-log` (registro da intervenção humana) e
é materializada pelo `escalation-harness` — ver
[Specification Map](../../specification-engineering/specification-map.md).

---

## 15. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Papel na escalada |
| --- | --- |
| **Skill** | `escalation-trigger` **detecta** o gatilho; não decide a escalada |
| **Subagente** | `escalation-subagent` **aciona** a escalada; não decide o mérito |
| **Harness** | `escalation-harness` opera a escalada e registra; `governance-harness` detecta gatilhos |
| **Service** | aplica a política de escalada dentro de contrato |
| **Tool** | não executa a ação escalada até o retorno do operador |
| **LLM / agente de código** | nunca decide/suprime a escalada; apenas descreve o contexto |

---

## 16. Método de verificação

1. **Cobertura de gatilhos:** verificar que cada gatilho da §8 gera escalada (e não prosseguimento).
2. Verificar que nenhuma operação fora de fronteira foi absorvida silenciosamente.
3. Verificar que toda escalada tem registro auditável e responsabilidade atribuída ao operador.
4. Verificar que LLM/agente/prompt/runtime não decidiram nem suprimiram a escalada.
5. Verificar que decisão escalada só vira verdade após retorno do operador e validação.
6. Violação ⇒ rejeição/escalada; verificação independente do agente e reconstruível.

---

## 17. Observabilidade esperada

- Registro, por escalada: gatilho · contexto · tenant · momento · decisão transferida · responsável.
- Registro de não-prosseguimento automático diante de gatilho.
- Trilha auditável e read-only para o artefato/operador que ela fiscaliza (`P9`, `DO6`).

---

## 18. Riscos arquiteturais evitados

- **Escalada tratada como falha** — sistema improvisando em vez de escalar.
- **Absorção silenciosa** — operação fora de fronteira seguindo sem registro.
- **Escalada decidida pelo modelo** — LLM/agente suprimindo ou resolvendo a exceção.
- **Perda de responsabilidade** — decisão escalada sem dono humano.
- **Verdade não-validada** — decisão escalada virando estado sem validação.

---

## 19. Fora de escopo

- **Não** define as fronteiras (isso é `operational-boundaries`), a ordem de valores
  (`conflict-resolution`) nem o registro detalhado de intervenção (`intervention-log`) — apenas os
  referencia.
- **Não** cria o `escalation-harness` executável nem nenhuma outra spec.
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  sprint plan, YAML/JSON, contrato machine-readable ou implementation harness.

---

## 20. Proveniência

`[PYR]` Context→Intent→Specification — agente como interface sob responsabilidade institucional;
fronteiras de decisão. `[HE-GOV]` Harness Engineering / Governança — enforcement determinístico;
parar e escalar em vez de prosseguir sem garantia. `[CE]` Context Engineering — auditoria orgânica;
responsabilidade preservada; independência do auditor.

---

## 21. Fronteiras (o que NÃO está aqui)

- **Não** substitui `P9`/`P7` nem a filosofia de responsabilidade: é a spec que os **opera** como
  contrato de escalada verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura — apenas fixa a política de escalada que as demais herdam.
