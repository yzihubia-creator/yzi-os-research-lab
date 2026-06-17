# YZI OS — Revisão de Clareza de Produto do PRD antes da Lane 5 · v1

> **Registro de revisão (somente leitura sobre artefatos existentes).** Avalia se o PRD
> institucional vigente ainda deixa claro **qual produto está sendo construído** antes da
> abertura da Lane 5. Não altera o PRD, não cria doutrina nova e não produz código, schema ou
> implementação.
>
> Camada: `product` · Status: revisão · Versão: v1 · Data: 2026-06-12
> Proveniência: `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]` (ver
> [`terminology.md`](../../foundation/terminology.md))

---

## 0. Natureza e escopo desta revisão

Esta é uma **revisão de clareza de produto**, não uma reescrita. Seu objeto é uma pergunta
única: *ao abrir a Lane 5, quem lê o PRD entende sem ambiguidade qual produto está sendo
construído, quem o opera e qual o papel do cockpit?*

O produto esperado, conforme contexto validado da task, é:

> Plataforma operacional cognitiva multi-tenant para operar **agentes institucionais** com
> governança, **tenants**, **memberships**, **permissões**, **tools**, **memória**,
> **observabilidade**, **execução controlada** e **cockpit humano**.

A revisão mede o PRD contra esse alvo e contra a arquitetura técnica já materializada nas Lanes
1–4. Não emite código, não modifica documentos canônicos e não abre a Lane 5.

---

## 1. Material revisado

| Documento | Papel na revisão |
| --- | --- |
| [`prd/yzi-os-prd-v1.md`](../../prd/yzi-os-prd-v1.md) | **Objeto primário** da revisão (PRD institucional, canônico, 2026-06-03) |
| [`product/yzi-os-product-architecture-plan-v1.md`](./yzi-os-product-architecture-plan-v1.md) | Camada de produto/go-to-market (**Growth OS**) |
| [`product/yzi-os-operating-model-v1.md`](./yzi-os-operating-model-v1.md) | Modelo operacional do produto (loop Detect→…→Learn) |
| [`product/yzi-product-reconstruction-checkpoint-276a.md`](./yzi-product-reconstruction-checkpoint-276a.md) | Invariantes de produto validados |
| Estado técnico Lanes 1–4 (Supabase `thwsltjcjrvtidhnfukc`; `tenants`, `tenant_memberships`, RLS, policies SELECT; Next.js 16 + Google OAuth; `proxy.ts` protege `/cockpit`) | **Arquitetura atual** contra a qual o PRD é confrontado |

---

## 2. Achado central — duas camadas de produto não reconciliadas

O corpus carrega hoje **duas descrições de produto coerentes entre si por dentro, mas não
costuradas uma à outra**:

- **Camada A — PRD institucional (`prd/yzi-os-prd-v1.md`).** O YZI OS é *infraestrutura
  operacional cognitiva stateful, multi-tenant e governada por specifications, para operar
  agentes institucionais*. Horizontal, governance-first, genérica. O documento declara, em §0:
  **“a arquitetura é o produto”**. Não menciona `Opportunity`, `Growth Leakage`, `cockpit`,
  `membership` ou jornada do usuário.

- **Camada B — Growth OS (`product-architecture-plan-v1` + `operating-model-v1` + corpus de
  homepage/onboarding).** O YZI OS é um *system of action* que detecta, prioriza, opera, recupera
  e aprende **oportunidades de crescimento**, com o inimigo de categoria **Growth Leakage** e o
  módulo **Executive Cockpit** como sala de operações. Lidera pelo **outcome**, não pela
  arquitetura: *“Lead with the operator, not the OS. Sell the outcome, not the architecture.”*

As duas camadas **podem** ser compatíveis: o `product-architecture-plan` descreve-se como
“plataforma horizontal … sobre a qual verticais podem ser instanciadas”, e o PRD §19 prevê
**verticalização** declarada. A leitura reconciliadora natural é: **A é o núcleo de governança;
B é a primeira aplicação/experiência e a narrativa de mercado sobre A.**

O problema **não** é incompatibilidade doutrinária — é **ausência de costura explícita**. Nenhum
dos dois lados referencia o outro. Um leitor que abra a Lane 5 apenas pelo PRD não saberá que o
cockpit, o operador e a operação de oportunidades existem; um leitor que abra pelo Growth OS não
verá a disciplina de governança que a Lane 5 deve honrar. **A clareza de produto está fragmentada
entre dois documentos que não se citam.** Este é o eixo de todos os riscos da Lane 5 abaixo.

---

## 3. Respostas às sete perguntas da revisão

| # | Pergunta | Veredito | Onde / por quê |
| --- | --- | --- | --- |
| 1 | O PRD deixa claro **o que é** o YZI OS como produto? | **Parcial** | Cristalino como *arquitetura/infra* (§1, §3, §7). Mas assume “a arquitetura é o produto” (§0) e não descreve o produto como **experiência operável** — quem abre a Lane 5 sabe o que o sistema *é*, não o que o usuário *faz*. |
| 2 | O PRD deixa claro **quem é o usuário principal**? | **Parcial** | Nomeia o **operador** (§2): quem define o objetivo do agente, o configura e responde pelo resultado. Conceito claro, mas **desconectado** de membership/role e do cockpit. |
| 3 | O PRD deixa claro o **papel do cockpit**? | **Não** | A palavra **“cockpit” não aparece no PRD**. O princípio que o governa existe (“a interface é projeção do estado, nunca sua fonte”, §3/§8), mas o cockpit como superfície de supervisão humana não é nomeado nem definido. Definido apenas na Camada B (Executive Cockpit / “sala de operações”). |
| 4 | O PRD deixa claro o papel de **tenants e memberships**? | **Tenants: sim · Memberships: não** | Multi-tenancy é forte e canônica (§18, §19, `P10`): fronteira como invariante de engenharia. **Membership não é mencionada** — o PRD não dá semântica de produto a como um humano pertence a um tenant, nem a papéis/permissões de UI. A tabela `tenant_memberships` existe na arquitetura, sem cobertura no PRD. |
| 5 | O PRD deixa claro o papel de **agentes/subagentes**? | **Agentes: sim · Subagentes: leve** | Agente é interface linguística institucional, governado não confiado, memória em 4 formas (§12). Subagente aparece só como artefato a jusante (§22) e implícito em decomposição/delegação com atenuação de privilégio (§9, §18). Aceitável para PRD arquitetural. |
| 6 | O PRD ainda fala em **runtime decisório pesado** ou algo incompatível com a arquitetura atual? | **Não — compatível** | O PRD é enfático e repetido: **runtime leve** que coordena e não governa (§3, §7, §13, `P6`, `P13`). Alinhado à arquitetura atual (services decidem, runtime/Next.js coordena, tools executam). **Nenhum resquício de runtime decisório.** A única menção a executor de spec é explicitamente “direção futura, não especificada” (§21). |
| 7 | Há **elementos obsoletos** no PRD? | **Sem obsolescência técnica; uma tensão de postura** | Nada tecnicamente vencido. A tensão é de postura: §0 “a arquitetura é o produto” colide com a regra de produto da Camada B (“Sell the outcome, not the architecture”). Para a Lane 5 — uma superfície **vista por humano** — a postura “arquitetura é o produto” é insuficiente isoladamente. |

### Leitura consolidada

O PRD continua **doutrinariamente sólido e internamente coerente**, e **compatível** com a
arquitetura atual no ponto mais sensível (runtime leve, backend decide, multi-tenant por desenho).
O que falta não é correção — é **vocabulário de produto que a Lane 5 consome diretamente**:
`cockpit`, `membership`/role do operador, e a costura PRD↔Growth OS.

---

## 4. Elementos obsoletos ou incompatíveis com a arquitetura atual

1. **Nenhum obsoleto técnico.** Não há runtime pesado, não há autoridade decisória no LLM, não há
   contradição com Supabase/RLS/OAuth. O PRD é neutro a implementação e sobrevive à arquitetura
   atual sem conflito.
2. **Lacuna, não obsolescência:** o PRD **não nomeia** três entidades que a arquitetura já
   materializou — **cockpit**, **membership** e o vínculo **operador↔tenant↔sessão**. A Lane 4
   fechou o *Cockpit Skeleton* documentalmente apoiada na Camada B, não no PRD.
3. **Tensão de fonte de verdade:** o PRD não referencia `operating-model-v1` nem
   `product-architecture-plan-v1`. Dois “primeiros marcos” de produto coexistem sem hierarquia
   declarada entre si.

---

## 5. Riscos para a Lane 5 se o PRD não for ajustado

| ID | Risco | Severidade |
| --- | --- | --- |
| **R1 — Cockpit ambíguo** | A Lane 5 constrói sobre o *Cockpit Skeleton* sem o PRD definir o que o cockpit é, para quem e o que mostra. Risco de materializar a superfície errada: console genérico de agentes (Camada A) **ou** sala de operações de oportunidades (Camada B). | **Alta** |
| **R2 — Fonte de verdade fragmentada** | Sem costura PRD↔Growth OS, a Lane 5 herda a tensão e implementa uma das narrativas por inércia, sem decisão registrada. Viola o checkpoint-por-fase. | **Alta** |
| **R3 — Membership sem semântica** | A Lane 5 lê sessão + tenant, mas o PRD não diz o que membership significa em produto (papéis, o que cada role vê/aprova no cockpit). Risco de UI de permissão improvisada, divergente do invariante de isolamento. | **Média** |
| **R4 — “Arquitetura é o produto” vaza para a tela** | Tomada ao pé da letra (§0), a Lane 5 pode expor a arquitetura (agents/tools/state) ao operador, contradizendo a regra “Lead with the operator, not the OS” e o teste de UX do operating-model (*alívio, não culpa*). | **Média** |

---

## 6. Recomendação objetiva

> **PRD APROVADO COM PEQUENOS AJUSTES — patch mínimo e aditivo antes da Lane 5.**

Justificativa: o **núcleo do PRD não precisa de reescrita** — está coerente, canônico e compatível
com a arquitetura atual (resposta 6 = sem runtime pesado). A Lane 5, porém, **consome diretamente**
três conceitos que o PRD não nomeia (cockpit, membership, costura com o Growth OS). Como esses
conceitos são exatamente o objeto da Lane 5, os ajustes são **aditivos e localizados**, não
correções de doutrina — mas devem **preceder** a abertura da Lane 5 para fechar R1 e R2, que são de
severidade alta. Os ajustes de R3 e R4 podem ser concorrentes, desde que registrados.

Classificação na escala da task: **aprovado com pequenos ajustes** (não “aprovado puro”, porque R1/R2
são bloqueantes para a Lane 5; não “precisa de patch [estrutural]”, porque nada do que existe está
errado — só falta um adendo).

---

## 7. Ajustes mínimos recomendados

Todos **aditivos** ao PRD vigente (nova seção/adendo ou poucas linhas), sem alterar doutrina:

1. **Costurar PRD ↔ Growth OS (fecha R2).** Adicionar parágrafo declarando a hierarquia: o PRD
   institucional é o **núcleo de governança**; o `product-architecture-plan-v1` e o
   `operating-model-v1` são a **primeira verticalização/experiência** sobre ele (instância de §19).
   Citar os dois documentos explicitamente.
2. **Nomear o cockpit (fecha R1).** Acrescentar parágrafo curto: o **cockpit** é a superfície humana
   de supervisão do operador — **projeção do estado** (§8), nunca sua fonte; é onde o operador vê a
   operação em andamento, aprova e intervém. Vincular ao princípio “interface é projeção do estado”
   e ao invariante de controlabilidade (§17).
3. **Dar semântica de produto a membership (mitiga R3).** Uma linha: **membership** é o vínculo
   governado entre operador e tenant que determina o que o operador vê e pode aprovar no cockpit,
   dentro da fronteira multi-tenant (`P10`). Conecta o §2 (operador) ao §18 (tenant).
4. **Qualificar “a arquitetura é o produto” (mitiga R4).** Nota em §0: a arquitetura é o produto
   *no nível de infraestrutura*; na superfície do operador (cockpit), o produto lidera pelo
   **outcome operado**, não pela arquitetura exposta — alinhando ao guardrail da Camada B.
5. **(Opcional) Subagente como unidade.** Uma linha situando o subagente como unidade de delegação
   com atenuação de privilégio (§9/§18), antecipando o “mapa de subagentes” (§22).

Escopo do patch: **somente texto aditivo no PRD**. Sem código, sem schema, sem alteração das oito
camadas canônicas, sem abertura da Lane 5.

---

## 8. Fronteiras (o que esta revisão NÃO faz)

- **Não** altera o PRD nem qualquer documento canônico — é registro somente-leitura.
- **Não** redige o patch recomendado; apenas o especifica.
- **Não** abre, planeja ou autoriza a Lane 5.
- **Não** produz código, schema, API, UI, migração, seed ou policy.
- **Não** reconcilia por conta própria as Camadas A e B — recomenda que o façam por decisão
  registrada.

---

## Readiness

`YZI_OS_PRD_REVIEWED_BEFORE_LANE_5`

Veredito: **PRD aprovado com pequenos ajustes** — patch mínimo e aditivo (itens 1–4 da §7)
recomendado **antes** da abertura da Lane 5 para fechar os riscos R1 e R2.
