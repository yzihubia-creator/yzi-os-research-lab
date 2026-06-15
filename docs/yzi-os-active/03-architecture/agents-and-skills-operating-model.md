# YZI OS — Modelo Operacional de Agentes e Skills

**Fonte ativa.** Alinhado a [`../00-product/product-definition.md`](../00-product/product-definition.md), [`../01-brand-positioning/brand-positioning.md`](../01-brand-positioning/brand-positioning.md), [`../01-brand-positioning/brand-dna.md`](../01-brand-positioning/brand-dna.md), [`../02-modules/module-map.md`](../02-modules/module-map.md) e [`../02-modules/radar-module-definition.md`](../02-modules/radar-module-definition.md).

> Documento de arquitetura conceitual. **Não** define schema, tabelas, UI final, integrações técnicas, automações reais, código, SQL nem MCP. O exemplo imobiliário existe só para validar a arquitetura — **o núcleo do YZI OS permanece horizontal**.

---

## 1. Objetivo

Definir como o YZI OS opera por dentro: o que é **agente**, o que é **skill**, o que é **módulo**, o que é **tool**, como se relacionam, e — principalmente — **o que NÃO deve virar agente**. Este modelo serve a qualquer segmento; a vertical imobiliária é apenas configuração e contexto, nunca identidade.

---

## 2. Princípio diretor (a segunda opinião central)

A maior ameaça arquitetural não é faltar agente — é **agentificar demais**. Uma lista de 15–17 agentes especializados contradiz três autoridades já fixadas:

- **Produto:** o diferencial "não é ter módulos — é a YZI cruzá-los" (`module-map.md` §4). O mesmo vale para agentes: o valor é uma inteligência que atravessa tudo, não um enxame de papéis isolados.
- **Marca:** "A IA trabalha, não conversa"; "Agente ancorado no estado completo da empresa" (`brand-positioning.md` §7, §13). Vários agentes desconexos reproduzem exatamente o anti-padrão "agentes de IA isolados, sem visão do negócio inteiro" que o posicionamento rejeita.
- **Superfície:** as telas lideram por **job/resultado, nunca por nomes de agentes** (`yzihub-first-implementation.md` §3). Agentes são o motor, não protagonistas.

**Tese:** o YZI OS tem **uma** inteligência protagonista — a YZI — que orquestra um **pequeno conjunto de motores duráveis** e invoca um **catálogo grande de skills reutilizáveis**. A complexidade vive nas skills (baratas, compostas, testáveis), não em dezenas de agentes (caros, com estado, difíceis de coordenar).

---

## 3. As quatro primitivas

| Primitiva | O que é | Tem estado? | Tem laço/ciclo? | Aparece na superfície? |
|---|---|---|---|---|
| **Módulo** | Superfície/capacidade do produto onde uma decisão ou ação vive (Dashboard, CRM, Radar, Conteúdo IA…) | Sim (dados do tenant) | Não por si | Sim, por job/resultado |
| **Agente** | Papel operacional **durável** com estado próprio e um **laço** (monitora, decide, age repetidamente ou continuamente) | Sim | Sim | Não — opera por baixo da YZI |
| **Skill** | Capacidade reutilizável **menor**, acionada sob demanda para uma tarefa específica; idealmente sem estado | Não (recebe contexto) | Não | Não |
| **Tool / integração** | Fonte externa ou canal acionável (WhatsApp, Ads, Trends, Calendar, CSV) | Externa | Não | Não (vira ação/dado) |

**Regras de não-confusão:**
- Módulo ≠ agente. "Radar" é módulo (superfície/capacidade); o motor que roda continuamente por trás dele pode ser um agente.
- Agente ≠ skill. Se a coisa só faz uma transformação sob demanda e não guarda estado nem tem laço, é **skill**.
- Tool ≠ skill. WhatsApp é tool; `draft-lead-follow-up-message` é skill; enviar a mensagem aprovada é uma **ação** da skill de execução usando a tool.

---

## 4. O teste "isto é um agente?"

Antes de criar um agente, responda. **Só é agente se a resposta for "sim" às três:**

1. **Estado:** precisa lembrar de algo entre uma invocação e outra?
2. **Laço:** tem um ciclo recorrente/contínuo (monitora → decide → age → reavalia), e não uma única passada?
3. **Autonomia entre sessões:** precisa agir ou vigiar **enquanto o gestor não está olhando**?

Se faltar qualquer uma → é **skill** (ou um conjunto de skills que a YZI compõe), não agente.

---

## 5. Agentes recomendados (núcleo pequeno e horizontal)

| Agente | Por que é agente (passa no teste §4) | Plano |
|---|---|---|
| **YZI Orchestrator** | É a própria YZI: mantém o estado vivo do negócio, roda o ciclo ver→decidir→agir→acompanhar, age entre sessões. É o **único protagonista** e a única "face". A ativação/onboarding é um **modo** deste agente, não um agente separado. | Start (limitado) → Pro → Growth |
| **Radar Agent** | Motor de oportunidade: monitora sinais continuamente, mantém estado de tendências/territórios, reavalia e reprioriza sem o gestor pedir. É o coração do Growth. Horizontal — território/imóvel é só contexto. | Growth |
| **Execution Agent** | Os "braços" da YZI: prepara drafts, executa ações **autorizadas** em canais, respeita créditos/permissões e **escreve o rastro**. Durável porque acompanha o resultado da ação após executá-la. | Pro (draft/preview) → Growth (execução) |
| **Continuity Agent** *(opcional)* | Laço de follow-up/relacionamento: detecta esfriamento e dispara retomadas autorizadas continuamente. Pode começar como skills sob a YZI e só "promover" a agente quando o volume justificar um laço próprio. | Pro → Growth |

Tudo o mais é **skill ou módulo**. A YZI Orchestrator é quem compõe as skills e delega aos motores duráveis.

---

## 6. O que NÃO deve virar agente (revisão da lista proposta)

A lista de candidatos foi avaliada pelo teste §4. Veredito:

| Candidato proposto | Veredito | Forma correta |
|---|---|---|
| YZI Orchestrator | **Agente** | A YZI (único protagonista) |
| Onboarding Agent | **Não** | **Modo de ativação** do Orchestrator |
| Segment Configuration Agent | Não | Skill `configure-segment-context` |
| Integration Setup Agent | Não | Skill(s) de setup + fluxo do Orchestrator |
| Data Intake Agent | Não | Skills `ingest-*` / `normalize-*` |
| Real Estate Radar Agent | **Agente, mas horizontal** | **Radar Agent** + skills de território (não um agente "imobiliário") |
| Territory Intelligence Agent | Não | Conjunto de skills do Radar (`map-territory-focus`, `score-territory-opportunity`…) |
| Listing / Inventory Agent | Não | Skills `ingest-listings-*` / `normalize-property-data` |
| Lead Qualification Agent | Não | Skills `classify-lead-intent` / `score-lead-fit` (módulo Leads/CRM) |
| CRM / Follow-up Agent | Não → **opcional Continuity Agent** | Skills sob a YZI; vira agente só se precisar de laço próprio |
| Content Strategy Agent | Não | Skills + módulo Conteúdo IA |
| Paid Traffic Agent | Não | Skills + módulo Tráfego Pago |
| Capture / Partnership Agent | Não | Skill `draft-builder-capture-message` |
| Calendar / Visit Scheduling Agent | Não | Skills + módulo Calendário |
| Finance / Revenue Agent | Não | Skills + módulo Financeiro |
| Compliance / Policy Agent | **Não — é camada** | **Camada de governança/guardrail** obrigatória em toda ação sensível (§8) |
| Report / Recommendation Agent | Não | Skills + módulo Relatórios (a YZI é a autora) |

Resultado: de ~17 candidatos, **3 agentes núcleo + 1 opcional**. O resto vira skill, módulo ou camada — exatamente o que evita complexidade artificial.

---

## 7. Catálogo de skills reutilizáveis

Skills são horizontais por padrão; o exemplo imobiliário mostra a aplicação. Classificação de risco: **read-only** (só lê/analisa) · **draft** (gera rascunho) · **preview** (simula uma ação sem executar) · **execução** (toca o mundo real — sempre com autorização).

### 7.1 Ativação e perfil
| Skill | Quem usa | Entrada | Saída | Tipo | Autorização |
|---|---|---|---|---|---|
| `extract-business-profile` | Orchestrator | conversa/respostas do onboarding | perfil estruturado do negócio | read-only | não |
| `classify-operator-type` *(ex: corretor/equipe/imobiliária)* | Orchestrator | perfil | tipo de operador | read-only | não |
| `configure-segment-context` | Orchestrator | tipo + perfil | parametrização do segmento (sem virar vertical no core) | read-only | não |
| `recommend-plan` | Orchestrator | perfil + jobs | plano sugerido (Start/Pro/Growth) + porquê | read-only | não |
| `generate-command-center-seed` | Orchestrator | dados coletados | seed coerente do Command Center | draft | não |

### 7.2 Dados e ingestão
| Skill | Tipo |
|---|---|
| `ingest-records-csv-or-manual` *(ex: imóveis, leads)* | execução (grava no tenant) → com confirmação |
| `normalize-domain-data` *(ex: normalize-property-data)* | read-only/draft |
| `map-inventory` *(ex: map-property-inventory)* | read-only |

### 7.3 Leads e relacionamento
| Skill | Tipo | Autorização |
|---|---|---|
| `classify-lead-intent` | read-only | não |
| `score-lead-fit` | read-only | não |
| `identify-cold-leads` *(ex: por território)* | read-only | não |
| `draft-lead-follow-up-message` | draft | sim, antes de enviar |
| `schedule-visit-follow-up` | preview→execução | sim |
| `prioritize-commission-opportunities` *(segmento)* | read-only | não |

### 7.4 Radar (motor de oportunidade)
| Skill | Tipo |
|---|---|
| `map-territory-focus` / `identify-target-neighborhoods` *(segmento)* | read-only |
| `detect-regional-demand` *(ex: detect-neighborhood-demand)* | read-only |
| `detect-launch-opportunity` / `detect-builder-or-development-signal` *(segmento)* | read-only |
| `score-territory-opportunity` | read-only |
| `generate-radar-opportunity-card` | draft (alimenta o card de §[Radar Opportunity Card]) |
| `propose-content-hub` *(ex: propose-neighborhood-content-hub)* | draft |
| `propose-campaign` *(ex: propose-property-campaign)* | draft |
| `draft-partner-capture-message` *(ex: construtora)* | draft | sim, antes de enviar |

### 7.5 Execução, governança e relatório
| Skill | Tipo | Autorização |
|---|---|---|
| `check-policy-risk` *(ex: check-real-estate-policy-risk)* | read-only (guardrail) | — (é o gate) |
| `generate-executive-summary` | read-only/draft | não |
| `write-action-trace` | execução (registro) | não (mas obrigatória) |

Toda skill `draft`/`preview` só vira ação real passando pela **Execution Agent** + **camada de governança** (§8).

---

## 8. Camada de governança e autorização

A governança **não é um agente** — é uma **camada obrigatória** que envolve toda ação sensível. Coerente com `brand-dna.md` §4 ("Autorização sempre") e `product-definition.md` §4.

**Estados honestos de execução** (reaproveitando o vocabulário do Radar Opportunity Card): `preview` · `draft` · `aguardando autorização` · `ajustado pelo humano` · `enviado para execução` · `executado` · `monitorando` · `descartado`.

**Regras invioláveis:**
- Nenhuma ação real sem autorização explícita.
- Mensagens a leads/parceiros, campanhas pagas e gastos exigem aprovação; campanha paga exige também **limite de orçamento**.
- Dados pessoais com cuidado; nada de inventar dado de imóvel, parceria ou disponibilidade sem fonte; **não prometer rentabilidade**.
- Toda ação gera **rastro** (`write-action-trace`); auditoria técnica é secundária (drawer), nunca produto.
- A YZI sempre mostra **o que vai fazer antes** e **o que fez depois**.

---

## 9. Planos: o que cada um ativa

| Plano | Agentes | Skills (núcleo) | Promessa |
|---|---|---|---|
| **Start** | YZI Orchestrator (limitado) | perfil, seed, `generate-executive-summary`, `classify/score-lead` básico, `write-action-trace` | Organizar e acompanhar a operação |
| **Pro** | + Execution Agent (draft/preview) + Continuity Agent (opcional) | + follow-up drafts, `schedule-visit-follow-up`, `identify-cold-leads`, recomendações da YZI | Operar, qualificar, recomendar e acompanhar |
| **Growth** | + **Radar Agent** + Execution Agent (execução real) | + todas as skills de Radar, `propose-content-hub`, `propose-campaign`, captação, execução autorizada contínua | Inteligência de oportunidade + execução contínua |

> Growth **não é "mais módulos"** (`decision-radar-positioning-v1.md` §3). É o plano onde o Radar Agent + execução contínua operam em plena capacidade.

---

## 10. Arquitetura conceitual recomendada

```
                    ┌─────────────────────────────────────────┐
                    │            YZI ORCHESTRATOR               │
                    │  (única face · estado vivo do negócio ·   │
                    │   ciclo ver→decidir→agir→acompanhar)      │
                    └───────────────┬───────────────────────────┘
        compõe skills · delega aos motores · pede autorização
   ┌────────────────┬──────────────┼──────────────┬────────────────┐
   ▼                ▼              ▼               ▼                ▼
[Radar Agent]  [Execution     [Continuity     [CATÁLOGO        [CAMADA DE
 motor de       Agent]          Agent]          DE SKILLS]       GOVERNANÇA]
 oportunidade   braços/exec     follow-up       (read-only/      gate obrigatório
 (Growth)       autorizada      (opcional)       draft/preview/   em toda ação
                                                 execução)        sensível
   │                │              │               │                │
   └────────────────┴──────────────┴───────────────┘                │
                         atuam sobre                                 │
   MÓDULOS (superfícies por job): Dashboard · CRM · Leads · Chat ·   │
   Follow-ups · Financeiro · Calendário · Radar · Tráfego · Conteúdo │
   IA · Relatórios · Créditos                                        │
                         usando                                      │
   TOOLS/INTEGRAÇÕES: WhatsApp · Gmail · Calendar · Ads · Trends ·   │
   SERP · CSV/Sheets · portais ── todas passam pelo gate ────────────┘
                         sobre
   CONTEXTO DO TENANT (dados do negócio: perfil, carteira, leads,
   território, financeiro, histórico, créditos)
```

Leitura: **território/segmento é eixo de contexto, não um agente.** O Radar Agent é horizontal; quando o tenant é imobiliário, ele carrega skills de território e passa a tratar bairro como unidade de oportunidade — sem que o core deixe de ser horizontal.

---

## 11. Relação com as fontes ativas

- **Núcleo decisão + ação contínua:** o Orchestrator é a encarnação do ciclo (`product-definition.md` §3–4).
- **Cruzamento de módulos como diferencial:** garantido por uma única inteligência orquestradora, não por agentes isolados (`module-map.md` §4).
- **Radar como motor de oportunidade:** o Radar Agent operacionaliza `radar-module-definition.md` e o `radar-opportunity-card-v1.md`.
- **Superfície por job/resultado:** agentes ficam por baixo; o gestor nunca navega por "nomes de agente" (`yzihub-first-implementation.md` §3).
- **Governança:** "Autorização sempre" vira camada explícita (`brand-dna.md` §4).

> Próximo documento relacionado: [`ai-first-tenant-activation-flow.md`](./ai-first-tenant-activation-flow.md), que aplica este modelo ao fluxo de ativação IA-first (com o exemplo imobiliário de João Pessoa).
