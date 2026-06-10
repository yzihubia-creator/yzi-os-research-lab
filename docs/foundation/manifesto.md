# YZI OS — Manifesto Institucional

> Documento fundacional. Declara a natureza arquitetural do YZI OS, o que ele é e o
> que ele recusa ser. Todos os demais documentos institucionais derivam deste.
>
> Camada: `foundation` · Status: canônico · Versão: v1

---

## 1. Declaração

O **YZI OS** é uma **infraestrutura operacional cognitiva stateful, multi-tenant e
governada por especificações**, destinada à operação de **agentes institucionais**.

Não é um produto centrado em um modelo de linguagem. É um **sistema operacional para
cognição institucional**: uma camada de runtime que monta contexto, aplica governança,
executa operações controladas, persiste estado e produz evidência auditável — usando
modelos de linguagem como um componente substituível, não como autoridade.

A premissa que organiza todo o sistema é uma inversão arquitetural:

> A capacidade operacional não é uma propriedade do modelo. É uma propriedade
> **emergente do sistema `modelo–harness–ambiente`**. `[HARNESS-RT]`

Atribuir competência ou falha ao modelo isolado é um **erro de atribuição**. Quando a
estrutura de runtime que o cerca — seleção de contexto, memória de projeto, registro de
ferramentas, atribuição de falhas, verificação, fronteiras de permissão — está presente
e bem desenhada, o sistema se comporta como se o modelo fosse competente. Quando essa
estrutura está ausente ou instável, o mesmo modelo aparenta incompetência. `[HARNESS-RT]`

O YZI OS é, portanto, o desenho deliberado dessa estrutura.

---

## 2. O que o YZI OS NÃO é

O YZI OS recusa explicitamente as seguintes categorizações. A recusa é arquitetural, não
retórica: cada item abaixo corresponde a um modelo de sistema cujas premissas o YZI OS
contradiz.

- **Não é um chatbot.** Um chatbot opera no modo `humano → modelo → resposta`, com o
  humano permanentemente no laço, gerindo o contexto a cada turno. O YZI OS opera no modo
  agêntico stateful, onde o estado persistido — não a conversa — governa a continuidade. `[PYR]`
- **Não é um wrapper de LLM.** Um wrapper delega ao modelo a autoridade decisória. No YZI
  OS, o modelo não decide: o backend decide, e o modelo é um motor linguístico invocado
  como serviço externo.
- **Não é uma automação simples.** Automação executa fluxos fixos. O YZI OS executa
  operações governadas por especificações, com atribuição de falha, verificação e
  proveniência como responsabilidades de primeira classe. `[HARNESS-RT]`
- **Não é um SaaS de IA nem uma plataforma de prompts.** O objeto de otimização não é a
  formulação de uma consulta, mas o desenho do **ambiente informacional** e do **estado
  operacional**. `[PYR]`
- **Não é um runtime centrado no modelo.** O runtime é leve e coordena; ele não detém
  autoridade comportamental. A governança vive fora da linguagem. `[HE-GOV]`
- **Não é um sistema frontend-first.** A verdade do sistema é o estado operacional
  persistido, não a interface. A interface é uma projeção do estado, nunca sua fonte.
- **Não é um assistente virtual, AI wrapper ou automação de atendimento.** Estas
  categorias colapsam compreensão, planejamento, execução e avaliação numa única
  interação. O YZI OS separa essas preocupações por desenho. `[CE]`

---

## 3. O que o YZI OS É

O YZI OS é, simultaneamente e por desenho:

- uma **infraestrutura operacional cognitiva stateful**;
- uma **plataforma institucional multi-tenant**;
- um **sistema operacional para agentes institucionais**;
- uma **arquitetura orientada à governança** (governance-first);
- uma **infraestrutura specification-driven**;
- um **ecossistema de runtime harness**;
- uma **plataforma operacional governada por contexto**.

Estas não são descrições alternativas do mesmo objeto. São **camadas de uma mesma
infraestrutura** que coexistem e se reforçam, descritas em detalhe na documentação de
arquitetura.

---

## 4. O modelo de governança (a inversão)

O sistema **não é modelado com o LLM no centro**. A governança real distribui-se por
camadas, e o LLM ocupa a posição de menor autoridade operacional:

| Camada | Responsabilidade |
| --- | --- |
| **Supabase / State** | Verdade operacional, persistência, continuidade, estado e histórico |
| **Services** | Lógica institucional, regras operacionais e validações |
| **RAG / XML / Policies** | Governança comportamental e recuperação contextual |
| **Agents** | Interface linguística institucional |
| **Tools** | Execução operacional controlada |
| **Observabilidade** | Auditoria, rastreabilidade e análise operacional |
| **Runtime leve** | Coordenação operacional, montagem de contexto e orquestração |
| **LLM** | Motor linguístico probabilístico, **sem autoridade operacional** |

O backend, o estado persistido, os services institucionais, o retrieval contextual e a
observabilidade **governam** o sistema. O LLM **não governa**.

Esta inversão tem fundamento teórico direto. A engenharia de contexto formaliza que, num
pacote de contexto bem desenhado, **o prompt é sempre o elemento de menor prioridade** — o
"Paradoxo do Metadado": o prompt *inicia* a interação, mas não a *governa*; a governança
pertence aos documentos de autoridade. `[CE]` A governança comportamental, por sua vez,
deve ser **determinística** (Enforcement) e não apenas **probabilística** (Guidance):
instruções em linguagem natural aumentam a probabilidade de conformidade, mas não a
garantem; a garantia vem de regras aplicadas e verificadas pelo runtime. `[HE-GOV]`

---

## 5. Princípio diretor

> **Confie na arquitetura, não no modelo.** `[CE]`

Agentes autônomos operam dentro de estruturas de governança que restringem seu espaço de
ação, **independentemente de seu raciocínio interno**. A confiança no comportamento de IA
aumenta apenas quando o espaço de soluções é deliberadamente estreitado por enforcement;
"o runtime tem de ser restringido para haver mais autonomia". `[HE-GOV]`

Disso decorre a regra de ouro institucional do YZI OS: a segurança e a coerência do sistema
são **propriedades da infraestrutura**, não de qualquer modelo específico. O sistema deve
manter suas propriedades operacionais sob substituição de provedor de modelo, sem alteração
do runtime, das specifications ou da camada de verificação. `[CE]`

---

## 6. Posição canônica deste documento

Este manifesto é a raiz da hierarquia documental. As declarações aqui feitas são
**vinculantes** para todos os documentos derivados:

- A **missão** (`mission.md`) explica o problema institucional que justifica esta arquitetura.
- A **filosofia** (`philosophy.md`) explicita a visão de mundo operacional.
- Os **princípios** (`principles.md`) enumeram as regras invioláveis derivadas desta inversão.
- A **terminologia** (`terminology.md`) fixa o vocabulário canônico.

Nenhum documento de arquitetura, governança, runtime ou specification pode contradizer este
manifesto. Em caso de conflito, este documento prevalece — exatamente como uma camada de
Authority prevalece sobre instruções de menor prioridade. `[CE]`
