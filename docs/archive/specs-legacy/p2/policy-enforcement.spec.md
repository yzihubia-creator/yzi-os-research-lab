# policy-enforcement

> **Specification documental (governança-first, linguagem natural estruturada).** Primeira spec da
> Onda P2 (Governance + Context/Retrieval). Define o que significa **enforcement determinístico** no
> YZI OS: como policies deixam de ser orientação linguística (Guidance) e passam a ser **critério
> verificável aplicado pós-geração**, com veredito independente de quem produziu a operação. **Não**
> é machine-readable: não contém YAML, JSON, schema, DSL, pseudo-código, contrato técnico executável,
> código, API, configuração nem plano de implementação.
>
> Onda: P2 (governança + contexto) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `policy-enforcement` |
| **Camada** | `governance` |
| **Owner arquitetural** | Governança |
| **Tenant-scope** | Global/instância (definição global, instância por tenant) |
| **Classe de operação** | enforcement |
| **Candidatura** | `harness` (`governance-harness`) |
| **Dependências** | [`layer-authority-model`](../p0/layer-authority-model.spec.md), [`conflict-resolution`](../p0/conflict-resolution.spec.md) |
| **Proveniência** | `[HE-GOV]` `[PYR]` `[CE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P5`, `P12`, `DO5`.
- [`/docs/foundation/philosophy.md`](../../foundation/philosophy.md) §4 — Guidance × Enforcement; independência de agente; "restringir habilita autonomia".
- [`/docs/foundation/manifesto.md`](../../foundation/manifesto.md) §4 — governança determinística vive fora da linguagem.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, o que é **enforcement determinístico** no YZI OS: a
aplicação e verificação de policies **pós-geração**, com veredito **pass/fail independente do agente**
que produziu a operação. Formaliza como policies deixam de ser apenas orientação linguística (Guidance)
e passam a ser **critério verificável** — distinto e superior, em garantia, à instrução em prompt.

A spec **extrai** (não inventa nem resume) `P5`/`P12`/`DO5` e a filosofia de governança fora da
linguagem. É a raiz do domínio de governança da Onda P2.

---

## 2. Problema que resolve

Se a governança vivesse no prompt, seria **probabilística** — sujeita à eloquência, à injeção e à
deriva ("guidance demais vira não-guidance"). Policies críticas dependentes apenas de prompt não
garantem conformidade e podem ser ignoradas por um agente/LLM.

Esta spec elimina o risco fixando o enforcement como **determinístico**: regras aplicadas e
verificadas pós-geração, com veredito reproduzível e independente de quem produziu a operação.

---

## 3. Autoridade envolvida

- **Aplicam e verificam enforcement:** **Services** e **harnesses** (sobretudo o `governance-harness`),
  dentro de contratos de specification.
- **Aciona, mas NÃO decide:** o **Runtime** pode disparar o enforcement, mas **não decide se a policy
  foi satisfeita**.
- **NÃO podem ignorar enforcement:** nenhum agente, LLM ou runtime pode contornar ou desligar o
  enforcement (`P1`, `P6`, `P12`).

---

## 4. Entradas esperadas

- A operação **já gerada** (proposta) a ser verificada, com seu tenant e contexto.
- As policies/specifications aplicáveis (incluindo `tenant-policy-pack`, quando houver).

## 5. Saídas esperadas

- Uma **decisão de enforcement verificável** (§8): permitido · bloqueado · escalado · pendente de
  evidência.
- O **registro auditável** da decisão (policy aplicada, veredito, justificativa, tenant) — base de
  conformidade.

---

## 6. Definição de policy enforcement

**Policy enforcement** é a **aplicação determinística de policies pós-geração**, produzindo um veredito
binário/verificável sobre uma operação **independentemente de qual agente a produziu**. Características:

1. **Determinístico:** a mesma operação recebe o mesmo veredito, sempre — não depende de probabilidade
   nem de formulação linguística.
2. **Pós-geração:** verifica o que foi produzido (Enforcement), não apenas orienta o que produzir
   (Guidance).
3. **Independente de agente:** a identidade de quem produziu a operação é irrelevante ao resultado; a
   qualidade é propriedade do harness, não do autor (`philosophy.md` §4).
4. **Fora da linguagem:** codificado em policies/contratos/harness, não no prompt (`P12`).

---

## 7. Diferença entre Guidance e Enforcement

| Dimensão | **Guidance** (pré-geração) | **Enforcement** (pós-geração) |
| --- | --- | --- |
| O que é | instruções, exemplos, decomposição | regras, validações, gates verificáveis |
| Garantia | aumenta a probabilidade de conformidade | produz veredito verificável pass/fail |
| Natureza | probabilística | determinística |
| Depende do autor? | sim (sensível à formulação) | não (independência de agente) |
| Localização | linguagem/prompt (Metadata) | policies/contratos/harness (Authority) |

Guidance **pode orientar, mas não garante** conformidade. **Nenhuma policy crítica DEVE depender
apenas de prompt** — guidance não substitui enforcement.

---

## 8. Tipos de decisão de enforcement

Toda verificação de policy produz **uma** decisão verificável:

| Decisão | Significado |
| --- | --- |
| **Permitido** | a operação satisfaz as policies aplicáveis; pode prosseguir |
| **Bloqueado** | a operação viola uma policy; não prossegue |
| **Escalado** | a decisão excede a fronteira automática; segue para o operador humano (registrada) |
| **Pendente de evidência** | falta evidência verificável; a operação aguarda até que a evidência exista |

Nenhuma operação prossegue sem uma destas decisões registrada. O veredito é reproduzível.

---

## 9. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Aplicar enforcement de forma determinística, não probabilística (`P12`, `DO5`).
2. Não fazer policy crítica depender apenas de prompt.
3. Produzir uma decisão verificável (permitido/bloqueado/escalado/pendente de evidência).
4. Garantir que nenhum agente/LLM/runtime ignore o enforcement.
5. Manter o runtime como **acionador**, não como decisor da satisfação da policy.
6. Aplicar/verificar enforcement via services/harnesses dentro de contratos.
7. Garantir independência de agente (mesmo veredito, qualquer autor).
8. Registrar toda decisão de enforcement como evidência auditável (`P9`, `DO6`).

---

## 10. Critérios de aceite

1. Referencia `P5`/`P12`/`DO5` e a filosofia de governança sem contradizê-las nem duplicá-las.
2. Define enforcement determinístico e o distingue de Guidance (§6, §7).
3. Fixa os quatro tipos de decisão (§8).
4. Fixa que policy crítica não depende só de prompt e que ninguém ignora enforcement.
5. Fixa runtime como acionador e services/harnesses como aplicadores/verificadores.
6. Exige independência de agente e registro auditável; é revisável por humano.

---

## 11. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Trata enforcement como probabilístico ou dependente de formulação de prompt.
2. Deixa policy crítica depender apenas de prompt.
3. Não produz decisão verificável, ou admite operação sem decisão registrada.
4. Permite que agente/LLM/runtime ignore ou desligue o enforcement.
5. Atribui ao runtime a decisão sobre a satisfação da policy.
6. Faz o veredito depender de quem produziu a operação (perde independência de agente).
7. Introduz código/API/schema/YAML/JSON/configuração/plano de implementação; ou reposiciona o YZI OS.

---

## 12. Relação com as camadas do YZI OS

Enforcement é a **camada RAG/XML/Policies** (posição 3) operando de forma determinística: governa o
comportamento. Services decidem dentro de contrato; o `governance-harness` aplica/verifica; o runtime
aciona sem decidir; Agents/LLM/prompt não contornam. Conflitos resolvem-se por
[`conflict-resolution`](../p0/conflict-resolution.spec.md); a autoridade segue
[`layer-authority-model`](../p0/layer-authority-model.spec.md).

---

## 13. Relação com specifications futuras

`policy-enforcement` é a raiz da governança da Onda P2: sustenta `behavioral-governance`,
`operational-boundaries` e `escalation-policy`, e é instanciada por tenant em `tenant-policy-pack` —
ver [Specification Map](../../specification-engineering/specification-map.md). O `governance-harness`
é a sua materialização como substrato. Toda spec futura cujo comportamento precise ser garantido
**DEVE** apoiar-se em enforcement, não em guidance.

---

## 14. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Relação com o enforcement |
| --- | --- |
| **Skill** | sua saída é submetida a enforcement; a skill não se autodeclara conforme |
| **Subagente** | opera dentro do veredito; o `verification-subagent` checa conformidade |
| **Harness** | o `governance-harness` aplica/verifica enforcement; nenhum harness o desliga |
| **Service** | aplica policies dentro de contrato (autoridade de aplicação) |
| **Tool** | só executa após decisão "permitido"; bloqueio impede o efeito |
| **LLM / agente de código** | nunca ignora enforcement; sua eloquência não altera o veredito |

---

## 15. Método de verificação

1. **Determinismo:** a mesma operação, submetida repetidamente, recebe o **mesmo veredito**.
2. **Independência de agente:** trocar o autor da operação **não** altera o veredito.
3. Verificar que toda operação tem uma decisão registrada (permitido/bloqueado/escalado/pendente).
4. Verificar que nenhuma policy crítica dependeu apenas de prompt.
5. Verificar que o runtime acionou, mas não decidiu a satisfação da policy.
6. Violação ⇒ rejeição/escalada; verificação independente do agente e reconstruível.

---

## 16. Observabilidade esperada

- Registro, por operação: policies aplicadas · veredito (permitido/bloqueado/escalado/pendente) ·
  justificativa · tenant · autor (apenas para auditoria, não para o veredito).
- Registro de escaladas e de pendências de evidência até resolução.
- Trilha auditável e read-only para o artefato que ela fiscaliza (`P9`, `DO6`).

---

## 17. Riscos arquiteturais evitados

- **Governança probabilística** — comportamento confiado ao prompt (`P12`).
- **Policy só em prompt** — regra crítica sem garantia (déficit de enforcement).
- **Enforcement ignorável** — agente/LLM/runtime contornando a policy.
- **Veredito dependente do autor** — perda de independência de agente.
- **Runtime decidindo conformidade** — coordenação confundida com governança.

---

## 18. Fora de escopo

- **Não** define o conteúdo das policies de comportamento (isso é `behavioral-governance`), as
  fronteiras de ação (`operational-boundaries`) nem a escalação em detalhe (`escalation-policy`) —
  apenas o **mecanismo** de enforcement.
- **Não** cria o `governance-harness` executável nem nenhuma outra spec.
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, configuração, plano de
  implementação, YAML/JSON ou contrato machine-readable.

---

## 19. Proveniência

`[HE-GOV]` Harness Engineering / Governança — Guidance × Enforcement; veredito pass/fail independente
de agente; "restringir habilita autonomia". `[PYR]` Context→Intent→Specification — policies como leis
sob a constituição; governança por enforcement. `[CE]` Context Engineering — governança fora da
linguagem; prompt é Metadata.

---

## 20. Fronteiras (o que NÃO está aqui)

- **Não** substitui `P5`/`P12`/`DO5` nem a filosofia de governança: é a spec que os **opera** como
  contrato de enforcement verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura — apenas fixa o mecanismo de enforcement que as demais herdam.
