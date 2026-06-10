# YZI OS — Terminologia Canônica

> Documento fundacional. Fixa o vocabulário institucional do YZI OS. Termos definidos aqui
> têm significado vinculante em toda a documentação. Termos técnicos consagrados em inglês
> são preservados sem tradução, por decisão arquitetural.
>
> Camada: `foundation` · Status: canônico · Versão: v1

---

## 1. Proveniência: os papers canônicos

A base teórica do YZI OS é composta por cinco trabalhos. Cada conceito derivado é anotado, na
documentação, com o código correspondente.

| Código | Trabalho | Pilar |
| --- | --- | --- |
| `[CE]` | *Context Engineering: A Methodology for Structured Human-AI Collaboration* (Calboreanu) | Context Engineering |
| `[PYR]` | *Context Engineering: From Prompts to Corporate Multi-Agent Architecture* (Vishnyakova) | Intent & Specification Engineering (Pirâmide PE→CE→IE→SE) |
| `[HE-GOV]` | *Harness Engineering: A Governance Framework for AI-Driven Software Engineering* (Kim) | Harness Engineering (Governança) |
| `[AHE]` | *Agentic Harness Engineering: Observability-Driven Automatic Evolution* (Lin et al.) | Runtime Harness / Agentic Evolution |
| `[HARNESS-RT]` | *AI Harness Engineering: A Runtime Substrate for Foundation-Model Software Agents* (Zhong & Zhu) | Runtime Harness Systems |

Os arquivos-fonte residem em `/docs/0X-*/*.pdf`. **Não devem ser resumidos**; servem como
referência arquitetural canônica.

---

## 2. Termos nucleares

**YZI OS.** Infraestrutura operacional cognitiva stateful, multi-tenant e specification-driven
para a operação de agentes institucionais. Não é chatbot, wrapper de LLM, SaaS de IA nem
runtime centrado no modelo. Ver [`manifesto.md`](manifesto.md).

**Operational cognitive infrastructure** (infraestrutura cognitiva operacional). A categoria à
qual o YZI OS pertence: um sistema que torna capacidade cognitiva probabilística em operação
institucional governada, auditável e contínua.

**Institutional agent** (agente institucional). Interface linguística da instituição; o
representante digital que age em seu nome, sob suas regras e responsabilidade. `[PYR]` Não é
decisor autônomo. Ver `P7`.

**Operator** (operador). Quem define o objetivo do agente, o configura e responde pelo
resultado. Distingue-se do mero *usuário*. A responsabilidade pelas ações recai sobre a
instituição que opera o agente. `[PYR]`

---

## 3. Camadas de governança

**State / Supabase layer.** Camada da verdade operacional: persistência, continuidade, estado
e histórico. Governa a continuidade (`P3`, `P17`).

**Services.** Camada da lógica institucional, regras operacionais e validações. **Decide**
(`P2`).

**Tools.** Conexões de execução controlada com sistemas externos (bancos, ERP, CRM, e-mail,
browser, APIs). Executam operações; registradas e permissionadas. `[PYR]` (`P14`).

**Agents.** Camada da interface linguística institucional (`P7`).

**LLM** (Large Language Model). Motor linguístico probabilístico — "cérebro sem mãos": entende,
raciocina e gera, mas não age no perímetro externo. `[PYR]` **Sem autoridade operacional**
(`P1`). Componente substituível.

**Runtime (leve).** Camada de coordenação: montagem de contexto, roteamento, orquestração e
ciclo de operação. Executa, mas **não governa** o comportamento (`P6`, `P13`).

**Observability.** Camada de auditoria, rastreabilidade e análise operacional (`P8`).

**Governance (RAG / XML / Policies).** Camada de governança comportamental e recuperação
contextual (`P5`, `P12`).

---

## 4. Context Engineering

**Context** (contexto). O ambiente informacional de execução do agente — seu sistema
operacional: gerencia memória, aloca recursos, isola processos e oferece interface aos
sistemas externos. `[PYR]` É uma **representação compilada de um sistema stateful**, não uma
string. `[PYR]`

**Context package** (pacote de contexto). Conjunto completo de informação fornecido a uma
interação, com papéis e prioridade explícitos. `[CE]`

**Roles do pacote de contexto** (prioridade decrescente): `[CE]`
1. **Authority** — concede permissão, define fronteiras e critérios de sucesso (governa).
2. **Exemplar** — fornece padrões/exemplos de formato.
3. **Constraint** — especifica limites e requisitos técnicos.
4. **Rubric** — define critérios de avaliação e qualidade.
5. **Metadata** — informação contextual sobre o pedido.

**Metadata Paradox.** O prompt do humano é sempre o elemento de **menor** prioridade no pacote
de contexto: ele *inicia* a interação, mas a **Authority governa** o resultado. `[CE]` Base do
`P1`.

**Critérios de qualidade de contexto** (produção): `[PYR]`
- **Relevance** (relevância) — só o necessário ao passo atual.
- **Sufficiency** (suficiência) — tudo o necessário para decidir sem adivinhação.
- **Isolation** (isolamento) — cada agente vê apenas o seu contexto.
- **Economy** (economia) — mínimo de tokens/recomposições preservando qualidade.
- **Provenance** (proveniência) — cada elemento rastreável à origem.

**Operações de contexto.** `write`, `select`, `compress`, `isolate`. `[PYR]`

**JIT knowledge logistics.** Logística de conhecimento just-in-time: o que incluir, quando,
em que forma, por quanto tempo e para qual sub-agente. `[PYR]`

**Context rot.** Modos de degradação do contexto: *poisoning* (envenenamento), *distraction*
(distração), *confusion* (confusão), *clash* (conflito). `[PYR]`

**Master Reference / Operator Authority.** Documento de autoridade versionado, reintroduzido a
cada interação, que acumula decisões e padrões — garante continuidade **sem** memória do
modelo. `[CE]` (`P3`, `P17`).

---

## 5. Memória e estado

**Operational state** (estado operacional). Verdade persistida, recuperável, isolável e
auditável do sistema. Prevalece sobre memória conversacional (`P17`).

**Tipos de memória** (distintos por custo, isolamento e ciclo de vida): `[PYR]`
- **Working** — conteúdo da janela de contexto agora.
- **Episodic** — log externo de interações passadas.
- **Semantic** — conhecimento estruturado, recuperado via RAG (vector store).
- **Procedural** — capacidade codificada.

**Stateful.** Propriedade de manter estado contínuo entre passos e sessões (vs. *stateless*,
que recomeça em branco). `[PYR]`

---

## 6. Intent & Specification Engineering

**Pirâmide de maturidade** (cumulativa): **PE → CE → IE → SE**. Cada nível absorve o anterior
como infraestrutura de sustentação. `[PYR]`
- **PE** (Prompt Engineering) — formulação de consulta.
- **CE** (Context Engineering) — engenharia do ambiente informacional / **estado**.
- **IE** (Intent Engineering) — codificação de metas, valores e hierarquias de trade-off na
  infraestrutura. "Contexto sem intenção é ruído." `[PYR]`
- **SE** (Specification Engineering) — corpus machine-readable de políticas, padrões de
  qualidade, procedimentos e acordos institucionais.

**Specification.** Descrição estruturada, coerente e versionada do que uma classe de operações
deve produzir. **Constituição** dos agentes: intenções são leis; contexto é a aplicação; o
prompt é uma ação. `[PYR]` (`P15`).

**Specification debt / context debt / intent debt.** Dívida acumulada quando agentes operam
sem normas formalizadas, sem contexto desenhado ou sem intenção codificada; vence com a
escala. `[PYR]`

**Contract-first decomposition.** Só se delega o que possui método de verificação precisamente
definido; caso contrário, decompõe-se recursivamente. `[PYR]`

**Delegation vs. decomposition.** Decomposição parte a tarefa; **delegação transfere
autoridade, responsabilidade e confiança**. `[PYR]`

**Privilege attenuation** (atenuação de privilégio). Na delegação, um agente transfere apenas a
fatia estritamente necessária de seus direitos; cada elo estreita as permissões. `[PYR]`
(`P10`, `DO2`).

---

## 7. Harness Engineering & Runtime

**Harness.** Substrato de runtime, **externo ao modelo**, que media como o agente observa,
age, recebe feedback e estabelece conclusão; expõe, traça e governa os recursos que o agente
usa. `[HARNESS-RT]` Distinto de prompt, de framework de agente, de ACI e de OS de agente.

**Onze responsabilidades de runtime do harness.** `[HARNESS-RT]` task interface · context
manager · tool registry · project memory · task state · observability layer · failure
attribution · verification protocol · permission boundary · entropy auditor · intervention
logger.

**Guidance vs. Enforcement.** `[HE-GOV]`
- **Guidance** (pré-geração) — instruções/exemplos; **probabilístico**; não garante.
- **Enforcement** (pós-geração) — regras/validações/gates; **determinístico**; pass/fail
  independente do autor.

**Tríade do harness (governança).** **Context** (conhecimento declarativo + procedural) ·
**Constraint** (Guidance + Enforcement) · **Convergence** (refino iterativo até *structural
idempotence*). `[HE-GOV]`

**Agent-independence** (independência de agente). Com enforcement abrangente, a identidade de
quem produziu a operação é irrelevante ao resultado estrutural. `[HE-GOV]`

**Structural idempotence.** Critério de convergência: reaplicar as regras não produz mais
mudança estrutural. `[HE-GOV]`

**Choice-space reduction.** Estreitamento do espaço de decisões por *elimination*,
*channeling* e *canonicalization*. `[HE-GOV]`

**Observability pillars** (evolução governada): `[AHE]`
- **Component observability** — cada componente editável como artefato isolado e reversível.
- **Experience observability** — destilação de traços brutos em corpus de evidência em camadas.
- **Decision observability** — cada edição pareada a uma predição verificável.

**Falsifiable contract.** Toda edição/decisão registrada como afirmação verificável, confirmada
ou revertida pela rodada seguinte; manifesto versionado com reversão em granularidade fina. `[AHE]`

**Controllability constraint.** O executor escreve apenas no seu workspace; verificador, tracer
e configuração são **read-only** — o sistema não pode desligar a própria fiscalização. `[AHE]`

**Progressive disclosure.** Divulgação progressiva de evidência/contexto para economizar tokens
e melhorar decisões. `[AHE]`

---

## 8. Verificação, auditoria e episódio

**Capability como propriedade de sistema.** `C_system = F(C_model, C_harness, C_environment, T)`
— capacidade é emergente do sistema, não do modelo. `[HARNESS-RT]` (`P1`).

**Episode** (episódio). Uma tentativa do sistema `modelo–harness–ambiente` de completar uma
operação especificada; é a **unidade de avaliação**. `[HARNESS-RT]`

**Episode package** (pacote de episódio). Registro auditável de um episódio: traces, patch,
relatório de verificação, atribuição de falha e auditoria de entropia. `[HARNESS-RT]`

**Verification protocol.** Mapeia requisitos a evidência determinística; conclusão é objeto
evidenciário, não asserção. Disciplina: **reproduzir → atribuir → corrigir → verificar →
reportar**. `[HARNESS-RT]` (`DO9`).

**Failure attribution.** Separa observação, comportamento esperado e diagnóstico; ocorre
**antes** de qualquer nova ação corretiva. `[HARNESS-RT]` (`P4` de auditoria; `DO9`).

**Entropy auditor.** Detecta o ônus de manutenção introduzido por operações (resíduo, deriva,
enfraquecimento de teste, violação de fronteira). `[HARNESS-RT]` (`DO10`).

**Intervention logger / M-HIR.** Registra intervenção humana como **sinal diagnóstico** de
responsabilidade de harness ausente; *missing-harness human intervention rate*. `[HARNESS-RT]`

**Provenance** (proveniência). Rastreabilidade de cada fragmento de contexto e de cada decisão
à sua origem (sistema, momento, nível de confiança). `[PYR]` (`P9`, `DO6`).

**Auditor independente.** Quem executa não pode auditar; avaliação independente captura erros
que a auto-revisão ignora. `[CE]`

---

## 9. Multi-tenancy

**Tenant.** Instituição cujo estado, contexto, memória e políticas são isolados de qualquer
outra (`P10`). O isolamento é arquitetural — a memória de um tenant é inacessível a partir de
outro. `[PYR]`

**Verticalização.** Especialização do YZI OS para um domínio institucional, expressa por
specifications, policies e retrieval próprios — sem alterar o núcleo de governança.

---

## 10. Convenções documentais

- **Camadas documentais:** `foundation`, `architecture`, `context-engineering`,
  `specification-engineering`, `harness-engineering`, `runtime`, `governance`, `agents`, `prd`.
- **Status:** `canônico` (vinculante) ou `derivado` (deve conformar-se aos canônicos).
- **Hierarquia de conflito entre documentos:** `manifesto` › `mission`/`philosophy` ›
  `principles` › demais.
- **Resolução de conflito entre princípios:** governada por uma **ordem de valores** —
  (1) verdade operacional, (2) segurança, (3) isolamento multi-tenant, (4) auditabilidade,
  (5) governança institucional, (6) continuidade de estado, (7) desacoplamento entre
  linguagem e operação, (8) leveza do runtime — e **não** pela numeração dos princípios. A
  numeração `P1…P18` é apenas referência estável de citação (ver [`principles.md`](principles.md)).
- **Proveniência inline:** conceitos derivados dos papers carregam seu código (`[CE]`, `[PYR]`,
  `[HE-GOV]`, `[AHE]`, `[HARNESS-RT]`).
