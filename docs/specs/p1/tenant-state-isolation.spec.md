# tenant-state-isolation

> **Specification documental (governança-first, linguagem natural estruturada).** Terceira spec da
> Onda P1 (State). Define o **isolamento do estado por tenant como invariante operacional**: todo
> estado é tenant-scoped e nenhum estado de um tenant pode ser lido, inferido, composto, recuperado,
> projetado ou alterado por outro. **Não** é machine-readable: não contém YAML, JSON, schema, DSL,
> pseudo-código nem contrato técnico executável.
>
> Onda: P1 (verdade operacional) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `tenant-state-isolation` |
| **Camada** | `state` / `tenant` |
| **Owner arquitetural** | Estado + Tenant |
| **Tenant-scope** | Per-tenant |
| **Classe de operação** | isolamento de estado |
| **Candidatura** | `service/tool` + `gov-doc` |
| **Dependências** | [`operational-state`](./operational-state.spec.md), [`event-driven-state`](./event-driven-state.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md), [`conflict-resolution`](../p0/conflict-resolution.spec.md) |
| **Proveniência** | `[PYR]` `[CE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P10` (multi-tenant por desenho), `DO2` (isolamento contextual).
- [`/docs/specs/p0/tenant-boundary.spec.md`](../p0/tenant-boundary.spec.md) — fronteira de tenant como invariante; bloqueio/escalada na dúvida.
- [`/docs/specs/p1/operational-state.spec.md`](./operational-state.spec.md) e [`event-driven-state`](./event-driven-state.spec.md) — estado-verdade e evolução por evento.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, que o **estado operacional é isolado por tenant**:
todo estado é tenant-scoped e o estado de um tenant é **inacessível** a partir de outro — por leitura,
inferência, composição, recuperação, projeção ou alteração. É a especialização, na camada de estado,
do invariante [`tenant-boundary`](../p0/tenant-boundary.spec.md).

A spec **extrai** (não inventa nem resume) `P10`/`DO2` e a fronteira de tenant, convertendo-as em
invariante de isolamento de estado. Depende de `operational-state`, `event-driven-state` e
`tenant-boundary`.

---

## 2. Problema que resolve

Se o estado não for isolado por tenant, dados, histórico ou memória de uma instituição podem ser
lidos, inferidos ou compostos a partir de outra — vazamento que é, ao mesmo tempo, falha de
controlabilidade e de segurança. A ambiguidade de tenant, se resolvida por inferência, abre o mesmo
buraco.

Esta spec elimina o risco fixando o isolamento de estado como **premissa arquitetural** (não
configuração) e tornando a ausência/ambiguidade de tenant uma condição de **bloqueio/escalada**.

---

## 3. Autoridade envolvida

- **Garantem o isolamento:** o Estado e a camada Tenant, aplicados por Services e verificados por
  Observabilidade.
- **NÃO resolvem ambiguidade de tenant por inferência:** o **Runtime** — coordena, mas não "adivinha"
  o tenant.
- **NUNCA atravessam a fronteira:** Tools e Services (fora do tenant autorizado), e Agents/LLM/prompt
  (via linguagem/contexto). Nenhum cruzamento é autorizável por estas camadas.

---

## 4. Entradas esperadas

- A identidade de tenant de cada estado, evento, acesso, recuperação, trace ou evidence package.
- Qualquer **caminho de acesso ao estado** a ser validado contra a fronteira de tenant.

## 5. Saídas esperadas

- Um **veredito de isolamento** por acesso: dentro do tenant / cruzamento detectado.
- Em cruzamento, ausência ou ambiguidade de tenant: **bloqueio** e/ou **escalada registrada**.

---

## 6. Contrato esperado (linguagem natural)

1. **Todo estado operacional DEVE** ser **tenant-scoped**.
2. **Nenhum** estado de um tenant **DEVE** ser **lido, inferido, composto, recuperado, projetado ou
   alterado** por outro tenant.
3. O isolamento de estado é **premissa arquitetural, NÃO configuração opcional**.
4. **Todo evento de estado DEVE** carregar tenant scope ([`event-driven-state`](./event-driven-state.spec.md)).
5. **Todo acesso ao estado DEVE** ser validado contra a tenant boundary.
6. **Retrieval, memória, traces, evidence packages e observabilidade DEVEM** respeitar o tenant scope.
7. **Tools e services NUNCA DEVEM** executar ação fora do tenant autorizado.
8. **Agentes NÃO DEVEM** usar linguagem, prompt ou contexto para atravessar a tenant boundary.
9. O **runtime NÃO DEVE** resolver ambiguidade de tenant por inferência.
10. Quando o tenant scope estiver **ausente, ambíguo ou conflitante**, a operação **DEVE** ser
    **bloqueada ou escalada** ([`conflict-resolution`](../p0/conflict-resolution.spec.md)).
11. A **verticalização DEVE** ocorrer por **contracts, policies e retrieval scoped**, **não** por
    bifurcação insegura do estado.

---

## 7. Formas de cruzamento proibidas

O isolamento cobre **toda** forma de acesso cruzado — não apenas leitura direta:

| Forma | Proibição |
| --- | --- |
| **Ler** | nenhum estado de outro tenant é legível |
| **Inferir** | nenhum estado de outro tenant é deduzível a partir de sinais |
| **Compor** | nenhum contexto/estado mistura tenants na composição |
| **Recuperar** | nenhum retrieval traz estado de outro tenant |
| **Projetar** | nenhuma projeção (conversa/saída) expõe estado de outro tenant |
| **Alterar** | nenhum evento muda estado de outro tenant |

Abrangência: estado, histórico, **memória**, **traces**, **evidence packages**, **retrieval** e
**observabilidade** — todos particionados por tenant.

---

## 8. Acesso ao estado validado contra a fronteira

1. Todo acesso ao estado **passa por validação** de tenant antes de qualquer leitura/alteração.
2. Todo **evento** de estado carrega tenant scope (herda `event-driven-state`); evento sem tenant é
   inválido (bloqueio/escalada).
3. **Retrieval/memória/traces/evidence/observabilidade** operam estritamente dentro do tenant; um
   trace ou evidence package de um tenant nunca é visível a outro.
4. A delegação preserva o tenant e estreita permissões (atenuação de privilégio); **delegar não
   transfere acesso cross-tenant**.

---

## 9. Ambiguidade de tenant → bloqueio ou escalada

- Tenant **ausente, ambíguo ou conflitante** ⇒ a operação **DEVE** ser **bloqueada**; se exigir
  decisão, **escalada registrada** (isolamento multi-tenant = valor 3 da ordem de valores).
- O **runtime NUNCA** resolve a ambiguidade por inferência, suposição ou "melhor palpite".
- Nenhum cruzamento é silenciosamente absorvido: bloqueio e escalada são registrados como evidência.

---

## 10. Verticalização sem bifurcação insegura do estado

A adaptação por instituição expressa-se por **contracts, policies e retrieval scoped** — **não** por
bifurcar o estado de forma insegura:

1. O estado permanece particionado por tenant sob um núcleo único; verticalizar **adiciona perímetro
   scoped**, não fragmenta o invariante de isolamento.
2. Configurar um tenant **NÃO DEVE** criar caminhos que contornem a fronteira de estado.
3. Nenhuma verticalização relaxa o isolamento (consistente com `tenant-boundary` §8).

---

## 11. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Tornar todo estado tenant-scoped e validar todo acesso contra a fronteira (§6, §8).
2. Impedir leitura/inferência/composição/recuperação/projeção/alteração cross-tenant (§7).
3. Garantir tenant scope em eventos, retrieval, memória, traces, evidence e observabilidade.
4. Impedir tools/services de agir fora do tenant e agents de cruzar via linguagem/prompt/contexto.
5. Impedir o runtime de inferir tenant.
6. Bloquear/escalar tenant ausente/ambíguo/conflitante.
7. Verticalizar por contracts/policies/retrieval scoped, não por bifurcação insegura.
8. Produzir evidência auditável de isolamento (`P9`, `DO6`).

---

## 12. Critérios de aceite

1. Referencia `P10`/`DO2` e `tenant-boundary` sem contradizê-las nem duplicá-las.
2. Fixa todo estado como tenant-scoped e enumera as formas de cruzamento proibidas (§6, §7).
3. Fixa validação de acesso e cobertura de retrieval/memória/traces/evidence/observabilidade (§8).
4. Fixa bloqueio/escalada na ausência/ambiguidade e proíbe inferência de tenant pelo runtime (§9).
5. Fixa verticalização sem bifurcação insegura (§10).
6. Define teste de vazamento cross-tenant (§17); é revisável por humano.

---

## 13. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Permite ler/inferir/compor/recuperar/projetar/alterar estado de outro tenant.
2. Trata o isolamento de estado como configuração opcional.
3. Admite evento/retrieval/memória/trace/evidence/observabilidade sem tenant scope.
4. Permite tool/service agir fora do tenant, ou agente cruzar via linguagem/prompt/contexto.
5. Permite o runtime inferir tenant em caso de ambiguidade.
6. Não bloqueia/escala tenant ausente/ambíguo/conflitante.
7. Verticaliza por bifurcação insegura do estado.
8. Introduz código/API/schema/YAML/JSON/contrato machine-readable; ou reposiciona o YZI OS.

---

## 14. Relação com as camadas do YZI OS

O isolamento de estado é **transversal**: Estado/Tenant garantem a partição; Services validam acesso;
Observabilidade audita por tenant; Runtime coordena sem inferir tenant; Agents/Tools/LLM/prompt nunca
cruzam. Herda a escada de [`layer-authority-model`](../p0/layer-authority-model.spec.md) e a fronteira
de [`tenant-boundary`](../p0/tenant-boundary.spec.md).

---

## 15. Relação com specifications futuras

Especializa [`tenant-boundary`](../p0/tenant-boundary.spec.md) para o estado e completa o trio
`operational-state` + `event-driven-state` + `tenant-state-isolation`. Sustenta `memory-model`
(memória isolada por tenant) e as specs de retrieval/observabilidade/harness que tocam estado — ver
[Specification Map](../../specification-engineering/specification-map.md). Toda spec futura que leia,
componha ou recupere estado **DEVE** respeitar este isolamento.

---

## 16. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Limite imposto pelo isolamento de estado |
| --- | --- |
| **Skill** | lê/compõe apenas estado do próprio tenant; nunca infere estado alheio |
| **Subagente** | recebe fatia scoped do tenant (atenuação de privilégio); não cruza |
| **Harness** | o `tenant-harness` valida o scope; observability/audit isolam traces/evidence por tenant |
| **Service** | valida acesso e age só no tenant autorizado |
| **Tool** | executa só no tenant autorizado, com tenant context e trace |
| **LLM / agente de código** | nunca cruza via linguagem/prompt/contexto; opera dentro do tenant |

---

## 17. Método de verificação

1. **Teste de vazamento cross-tenant:** para todo caminho (ler/inferir/compor/recuperar/projetar/
   alterar), verificar **resultado negativo** — nenhum estado de outro tenant é alcançável.
2. Verificar que todo evento/retrieval/memória/trace/evidence carrega tenant scope.
3. Verificar que tools/services não agiram fora do tenant e que agentes não cruzaram via linguagem.
4. Verificar que ambiguidades de tenant geraram bloqueio/escalada e que o runtime não inferiu tenant.
5. Verificar que a verticalização não bifurcou o estado de forma insegura.
6. Violação ⇒ rejeição/escalada; verificação independente do agente e reconstruível.

---

## 18. Observabilidade esperada

- Registro, por acesso ao estado: tenant de origem, tenant alvo, forma de acesso, veredito
  (dentro/cruzamento), ação (permitido/bloqueado/escalado).
- Registro de toda ambiguidade de tenant e sua resolução (bloqueio/escalada).
- Traces e evidence packages **isolados por tenant**; auditoria por tenant.
- Trilha auditável e read-only para o artefato que ela fiscaliza (`P9`, `DO6`).

---

## 19. Riscos arquiteturais evitados

- **Vazamento de estado cross-tenant** — por leitura, inferência, composição, recuperação, projeção
  ou alteração (`P10`).
- **Isolamento como configuração** — fronteira de estado removível/relaxável.
- **Inferência de tenant** — runtime "adivinhando" tenant em ambiguidade.
- **Cruzamento por linguagem** — agente/prompt atravessando a fronteira via contexto.
- **Bifurcação insegura** — verticalizar fragmentando o invariante de isolamento.
- **Trace/evidence vazado** — observabilidade de um tenant visível a outro.

---

## 20. Fora de escopo

- **Não** redefine o estado-verdade (isso é `operational-state`), a evolução por evento
  (`event-driven-state`) nem a fronteira geral (`tenant-boundary`) — apenas os especializa para o
  isolamento de estado.
- **Não** define as formas de memória (isso é `memory-model`) — apenas exige que sejam isoladas.
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  sprint plan, YAML/JSON, contrato machine-readable ou implementation harness.

---

## 21. Proveniência

`[PYR]` Context→Intent→Specification — cada agente vê apenas seu contexto; isolamento de memória de
projeto arquitetural; atenuação de privilégio; delegação ≠ decomposição. `[CE]` Context Engineering —
isolamento de processos; confiar na arquitetura; trilha de auditoria orgânica.

---

## 22. Fronteiras (o que NÃO está aqui)

- **Não** substitui `P10`/`DO2` nem `tenant-boundary`: é a spec que os **opera** como contrato de
  isolamento de estado verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura — apenas fixa o invariante de isolamento de estado que as
  demais herdam.
