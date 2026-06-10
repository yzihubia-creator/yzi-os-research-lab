# tenant-boundary

> **Specification documental (governança-first, linguagem natural estruturada).** Quarta e última
> spec da Onda P0. Declara a **fronteira entre tenants como invariante de engenharia** — não como
> configuração. Fixa que estado, contexto, memória e políticas são particionados por tenant, que
> nenhum caminho atravessa a fronteira, e que dúvida sobre fronteira **bloqueia ou escala**. **Não**
> é machine-readable: não contém YAML, JSON, schema, DSL, pseudo-código nem contrato técnico
> executável.
>
> Onda: P0 (fundacional; raiz da partição multi-tenant) · Status: proposta para aprovação ·
> Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `tenant-boundary` |
| **Camada** | `tenant` |
| **Owner arquitetural** | Tenant |
| **Tenant-scope** | Per-tenant (é a spec que define a partição) |
| **Classe de operação** | isolamento (fronteira) |
| **Candidatura** | `gov-doc` + `harness` |
| **Dependências** | [`core-operational-principles`](./core-operational-principles.spec.md), [`layer-authority-model`](./layer-authority-model.spec.md), [`conflict-resolution`](./conflict-resolution.spec.md) |
| **Proveniência** | `[PYR]` `[CE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P10` (multi-tenant por desenho), `DO2` (isolamento contextual).
- [`/docs/foundation/philosophy.md`](../../foundation/philosophy.md) §7 — isolamento como invariante de engenharia; atenuação de privilégio; delegação ≠ decomposição.
- [`/docs/specs/p0/conflict-resolution.spec.md`](./conflict-resolution.spec.md) — isolamento multi-tenant como valor 3; escalada.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, que o **isolamento entre tenants é um invariante de
engenharia** do YZI OS — uma premissa arquitetural, não uma configuração adicional. Estado, contexto,
memória e políticas são **particionados por tenant** em todas as camadas, e **nenhum caminho**
atravessa a fronteira entre tenants.

A spec **extrai** (não inventa nem resume) `P10`/`DO2` e a filosofia de isolamento, convertendo-os em
invariante contratual auditável. É a **raiz da partição multi-tenant** sobre a qual todas as demais
specs por-tenant (`tenant-configuration`, `tenant-policy-pack`, `tenant-retrieval-scope`,
`tenant-state-isolation`) se apoiam.

---

## 2. Problema que resolve

Tratar isolamento como configuração — algo que se "liga" por tenant — abre caminho para vazamento
cross-tenant: estado, memória ou contexto de uma instituição acessível a partir de outra. Vazamento é,
simultaneamente, problema de **controlabilidade** e de **segurança da informação**.

Esta spec elimina o risco fixando a fronteira como **invariante**: o sistema é particionado por
desenho, a fronteira não é opcional, e qualquer dúvida sobre ela **bloqueia ou escala** — nunca
prossegue por suposição.

---

## 3. Autoridade envolvida

- **Detêm autoridade sobre a fronteira:** o Estado e a camada Tenant (partição), aplicadas por
  services/policies e verificadas por observabilidade.
- **NUNCA autorizam cruzamento de fronteira:** o LLM, o agente, o runtime e o prompt — nenhum deles
  pode permitir, relaxar ou decidir um cruzamento de tenant boundary.

---

## 4. Entradas esperadas

- A identidade de tenant de cada operação, dado, fragmento de contexto, memória ou política.
- Qualquer **caminho de acesso** (leitura, recuperação, execução, delegação) a ser verificado quanto
  à fronteira.

## 5. Saídas esperadas

- Um **veredito de fronteira** por acesso: dentro do tenant / cruzamento detectado.
- Em cruzamento ou dúvida: **bloqueio** e/ou **escalada registrada** — nunca prosseguimento.

---

## 6. Contrato esperado (linguagem natural)

1. Estado, contexto, memória, políticas, **traces e evidence packages** **DEVEM** ser
   **particionados por tenant** em todas as camadas (`P10`, `DO2`). Nenhum contexto, estado,
   memória, policy, trace, tool execution ou evidence package cruza a fronteira.
2. **Nenhum caminho** (leitura, recuperação, execução, delegação) **DEVE** atravessar a fronteira
   entre tenants.
3. A fronteira **NÃO É configuração**: é invariante de engenharia, não removível nem relaxável por
   ajuste.
4. Quando houver **dúvida** sobre a fronteira de tenant, a execução **DEVE** ser **bloqueada ou
   escalada** — nunca presumida.
5. O LLM, o agente, o runtime e o prompt **NUNCA DEVEM** autorizar cruzamento de tenant boundary.
6. Na delegação, a permissão é **atenuada** (atenuação de privilégio) e **sempre** dentro do mesmo
   tenant; delegar não transfere acesso cross-tenant.

---

## 7. A fronteira como invariante de engenharia

O isolamento é **invariante**, não recomendação (`philosophy.md` §7). É particionado por tenant, em
todas as camadas:

| Dimensão | O que é particionado |
| --- | --- |
| **Estado** | persistência, continuidade, histórico — inacessíveis cross-tenant (`tenant-state-isolation`) |
| **Contexto** | composição e recorte de contexto isolados por tenant (`DO2`) |
| **Memória** | working / episódica / semântica / procedural — isoladas por tenant |
| **Políticas** | policy pack aplicado por tenant (`tenant-policy-pack`) |
| **Retrieval** | corpus e visibilidade restritos ao tenant (`tenant-retrieval-scope`) |
| **Observabilidade** | traces, logs e **evidence packages** isolados por tenant; auditoria por tenant |
| **Execução** | toda tool execution carrega tenant context; não cruza a fronteira |

**Atenuação de privilégio:** na delegação, cada elo **estreita** as permissões e permanece no mesmo
tenant; **delegar ≠ decompor** — sem essa distinção, a arquitetura degenera em "monólito distribuído
com ilusão de independência" (`philosophy.md` §7).

---

## 8. Verticalização por configuração (não por bifurcação do core)

A adaptação a cada instituição (verticalização) expressa-se por **configuração declarada por
tenant** — specs, policies, corpus e perímetro — **sem bifurcar nem alterar o núcleo de governança**:

1. Um tenant é configurado, **não** forkado: o core permanece único e estável (`tenant-configuration`).
2. Mudar um tenant **NÃO DEVE** alterar o núcleo nem outro tenant.
3. A verticalização governada **nunca** relaxa a fronteira: configuração adiciona perímetro, não o
   remove.

---

## 9. Dúvida sobre a fronteira → bloqueio ou escalada

- Sempre que a identidade de tenant de um dado/caminho for **ambígua, ausente ou inconsistente**, a
  operação **DEVE** ser **bloqueada**; se exigir decisão, **escalada registrada** (via
  [`conflict-resolution`](./conflict-resolution.spec.md), valor 3 = isolamento multi-tenant).
- A dúvida **NUNCA** se resolve por suposição, conveniência ou inferência do modelo.
- Nenhum cruzamento é silenciosamente absorvido: bloqueio e escalada são **registrados** como
  evidência.

---

## 10. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Particionar estado, contexto, memória e políticas por tenant (`P10`, `DO2`).
2. Garantir que nenhum caminho atravessa a fronteira (leitura, recuperação, execução, delegação).
3. Tratar a fronteira como invariante, **não** como configuração.
4. Bloquear ou escalar em caso de dúvida sobre a fronteira.
5. Impedir que LLM/agente/runtime/prompt autorize cruzamento.
6. Aplicar atenuação de privilégio na delegação, sempre dentro do tenant.
7. Produzir evidência auditável de fronteira (`P9`, `DO6`).

---

## 11. Critérios de aceite

1. Referencia `P10`/`DO2` e a filosofia de isolamento sem contradizê-las nem duplicá-las.
2. Fixa a fronteira como invariante de engenharia (não configuração) e a partição por tenant (§7).
3. Fixa verticalização por configuração sem bifurcação do core (§8).
4. Fixa bloqueio/escalada em caso de dúvida (§9).
5. Proíbe autorização de cruzamento por LLM/agente/runtime/prompt.
6. Define método de verificação de não-vazamento (§16) e é revisável por humano.

---

## 12. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Trata o isolamento como configuração removível ou relaxável.
2. Permite qualquer caminho que atravesse a fronteira entre tenants.
3. Resolve dúvida de fronteira por suposição em vez de bloqueio/escalada.
4. Permite que LLM/agente/runtime/prompt autorize cruzamento.
5. Verticaliza por **bifurcação do core** em vez de configuração por tenant.
6. Transfere acesso cross-tenant na delegação (sem atenuação de privilégio).
7. Introduz código, API, schema, YAML/JSON, DSL ou contrato machine-readable.
8. Resume/duplica/inventa doutrina, ou reposiciona o YZI OS como chatbot/SaaS/automação/wrapper.

---

## 13. Relação com as camadas do YZI OS

A fronteira é **transversal** às 9 camadas: estado, contexto, memória, policies e retrieval são
particionados; a autoridade sobre a fronteira pertence a Estado/Tenant/Services (não a Agents/Tools/
LLM/Runtime), preservando a escada de [`layer-authority-model`](./layer-authority-model.spec.md). Não
é uma camada — é uma **partição** que atravessa todas.

---

## 14. Relação com specifications futuras

`tenant-boundary` é a **raiz** das specs por-tenant: `tenant-state-isolation`, `tenant-configuration`,
`tenant-policy-pack` e `tenant-retrieval-scope` dependem dela
(ver [Specification Map](../../specification-engineering/specification-map.md)). Toda spec futura que
toque estado, contexto, memória, retrieval, execução ou delegação **DEVE** respeitar esta fronteira.
Encerra a Onda P0: com `core-operational-principles`, `layer-authority-model` e `conflict-resolution`,
completa o conjunto de invariantes-raiz que desbloqueia a Onda P1 (State).

---

## 15. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Limite imposto pela fronteira |
| --- | --- |
| **Skill** | opera apenas dentro do tenant-scope; não recupera nem compõe contexto cross-tenant |
| **Subagente** | recebe, por delegação, fatia estreitada **dentro** do mesmo tenant (atenuação de privilégio) |
| **Harness** | o `tenant-harness` impõe e verifica a fronteira; nenhum harness a relaxa |
| **Service** | decide dentro do contrato e do tenant; não decide cruzamentos |
| **Tool** | executa só dentro do tenant, sob permissão e trace |
| **LLM / agente de código** | nunca autoriza cruzamento; opera sob harness, dentro do tenant |

---

## 16. Método de verificação

1. **Teste de vazamento cross-tenant:** verificar que nenhum caminho (leitura, recuperação, execução,
   delegação) retorna dado/estado/contexto de outro tenant — resultado negativo em **qualquer**
   caminho.
2. Verificar que dúvidas de fronteira geraram **bloqueio/escalada registrada**.
3. Verificar que nenhum cruzamento foi autorizado por LLM/agente/runtime/prompt.
4. Verificar que a verticalização não bifurcou o core nem relaxou a fronteira.
5. Violação ⇒ rejeição/escalada; verificação independente do agente e reconstruível.

---

## 17. Observabilidade esperada

- Registro, por acesso: tenant de origem, tenant alvo, veredito (dentro/cruzamento), ação
  (permitido/bloqueado/escalado).
- Registro de toda dúvida de fronteira e sua resolução (bloqueio ou escalada).
- Trilha auditável e read-only para o artefato que ela fiscaliza (`P9`, `DO6`).

---

## 18. Riscos arquiteturais evitados

- **Vazamento cross-tenant** — estado/memória/contexto de um tenant acessível a outro (`P10`).
- **Isolamento como configuração** — fronteira removível/relaxável por ajuste.
- **Cruzamento por suposição** — prosseguir sob identidade de tenant ambígua.
- **Autorização indevida** — LLM/agente/prompt liberando cruzamento.
- **Verticalização por fork** — bifurcar o core em vez de configurar por tenant.
- **Monólito distribuído** — delegação sem atenuação de privilégio.

---

## 19. Fora de escopo

- **Não** detalha a configuração por tenant (isso é `tenant-configuration`), o policy pack
  (`tenant-policy-pack`), o isolamento de estado (`tenant-state-isolation`) nem o escopo de retrieval
  (`tenant-retrieval-scope`) — apenas fixa a fronteira que todos herdam.
- **Não** cria nenhuma outra spec (encerra a Onda P0).
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  YAML/JSON ou contrato machine-readable.

---

## 20. Proveniência

`[PYR]` Context→Intent→Specification — cada agente vê apenas seu contexto; isolamento de memória de
projeto arquitetural; atenuação de privilégio; delegação ≠ decomposição. `[CE]` Context Engineering —
isolamento de processos; confiar na arquitetura; trilha de auditoria orgânica.

---

## 21. Fronteiras (o que NÃO está aqui)

- **Não** substitui `P10`/`DO2` nem a filosofia de isolamento: é a spec que os **opera** como
  contrato de fronteira verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura — apenas fixa o invariante de partição que todas herdam.
