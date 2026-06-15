# YZI OS — Fluxo de Ativação IA-First de Tenant

**Fonte ativa.** Alinhado a [`agents-and-skills-operating-model.md`](./agents-and-skills-operating-model.md), [`../00-product/product-definition.md`](../00-product/product-definition.md), [`../02-modules/module-map.md`](../02-modules/module-map.md), [`../02-modules/radar-module-definition.md`](../02-modules/radar-module-definition.md), [`../04-implementation/yzihub-command-center-v1.md`](../04-implementation/yzihub-command-center-v1.md) e [`../04-implementation/radar-opportunity-card-v1.md`](../04-implementation/radar-opportunity-card-v1.md).

> Documento de arquitetura conceitual. **Não** define schema, UI final, integrações técnicas, automações reais, código, SQL nem MCP.
>
> **Imobiliário em João Pessoa é EXEMPLO de validação, não vertical do core.** O fluxo é horizontal; a vertical é configuração e contexto do tenant. O core do YZI OS continua horizontal (`product-definition.md` §1–2).

---

## 1. Objetivo

Descrever como o YZI OS conduz, de forma **IA-first**, a jornada de um visitante até uma operação ativa com Command Center montado e primeiras ações — sem que o cliente caia num dashboard vazio. A YZI conduz a ativação como trabalho (não como chatbot).

---

## 2. Fluxo ponta a ponta

```
Visitante no site (YZIHUB)
   → Funil (entende dor: "decidir e agir todo dia")
   → Conversa com a YZI (diagnóstico, não papo)
   → CTA / escolha de plano (Start · Pro · Growth)
   → Ativação conduzida pela YZI (modo de ativação do Orchestrator)
        1. Perfil do negócio        (extract-business-profile)
        2. Tipo de operador         (classify-operator-type)
        3. Território/contexto      (map-territory-focus)*
        4. Carteira/inventário      (map-inventory, ingest-*)*
        5. Canais e integrações     (setup guiado + autorização)
        6. Dados iniciais (seed)    (ingest/normalize)
        7. Plano/módulos            (recommend-plan)
   → Tenant configurado (contexto do negócio pronto)
   → Command Center inicial montado (generate-command-center-seed)
   → Primeiras recomendações e oportunidades da YZI
   → Primeiras ações (com autorização nas sensíveis)
```
\* passos com contexto de segmento — no core são genéricos.

A regra é a de `yzihub-first-implementation.md` §3: a superfície lidera por **job/resultado**, nunca por nomes de agentes/módulos.

---

## 3. Fases da ativação (papéis e governança)

| Fase | Quem conduz | Skills | Tipo |
|---|---|---|---|
| Diagnóstico no funil | YZI Orchestrator (modo ativação) | `extract-business-profile`, `classify-operator-type` | read-only |
| Mapa de contexto | Orchestrator | `map-territory-focus`, `map-inventory` | read-only |
| Setup de integrações | Orchestrator | setup guiado (cada conexão pede **autorização**) | execução c/ aprovação |
| Ingestão inicial | Orchestrator | `ingest-records-csv-or-manual`, `normalize-domain-data` | execução c/ confirmação |
| Recomendação de plano | Orchestrator | `recommend-plan` | read-only |
| Montagem do cockpit | Orchestrator | `generate-command-center-seed` | draft |
| Primeiras oportunidades | Radar Agent (se Growth) | `detect-*`, `score-*`, `generate-radar-opportunity-card` | draft |
| Primeiras execuções | Execution Agent | drafts de mensagem/campanha | preview → execução c/ autorização |

Nada sensível é executado sem passar pela **camada de governança** (modelo §8).

---

## 4. Exemplo de validação — corretor / imobiliária em João Pessoa

> Exemplo para testar a arquitetura. Não transforma o YZI OS em produto imobiliário.

### 4.1 Perguntas que a YZI faz (diagnóstico)
- Você atua como **corretor autônomo, equipe ou imobiliária**?
- Quais **bairros/regiões** você trabalha hoje? (ex.: Bessa, Cabo Branco, Manaíra, Altiplano, Bancários)
- Que **tipos de imóvel** e faixa de **ticket**?
- Como está sua **carteira** (imóveis ativos) e sua **captação**?
- Por onde chegam seus **leads** hoje (WhatsApp, Instagram, portais, indicação)?
- Você já roda **tráfego pago** ou **conteúdo**?
- Tem **CRM** ou planilha? Quer importar imóveis/leads?

### 4.2 Dados que coleta (contexto do tenant)
Perfil do operador · territórios-alvo · tipologias e ticket · carteira de imóveis · leads (quentes/frios) · canais ativos · histórico de vendas/captação · metas.

### 4.3 Integrações que sugere (por plano)
Start: CSV/Sheets (imóveis e leads), Gmail, Calendar. · Pro: WhatsApp Business, Instagram/Meta. · Growth: Google Ads, Meta Ads, Trends/Search demand, SERP, Ads Library, portais.

### 4.4 Módulos ativados por plano
- **Start:** Dashboard, CRM/Leads (básico), Follow-ups (básico), Calendário, Financeiro (básico), Relatórios simples, YZI em recomendação.
- **Pro:** + Chat, Follow-ups avançado, recomendações da YZI, módulos por segmento.
- **Growth:** + **Radar**, Tráfego Pago, Conteúdo IA, execução contínua autorizada.

### 4.5 Agentes e skills envolvidos
- **YZI Orchestrator:** conduz tudo, monta o cockpit, prioriza.
- **Radar Agent (Growth):** detecta bairro em alta, lançamento, lead reativável.
- **Execution Agent:** prepara drafts (mensagem ao lead, à construtora, campanha) e executa o autorizado.
- **Skills:** `map-territory-focus`, `identify-target-neighborhoods`, `detect-neighborhood-demand`, `score-territory-opportunity`, `generate-radar-opportunity-card`, `propose-neighborhood-content-hub`, `propose-property-campaign`, `identify-cold-leads`, `draft-lead-follow-up-message`, `draft-builder-capture-message`, `prioritize-commission-opportunities`, `check-real-estate-policy-risk`, `write-action-trace`.

### 4.6 Primeiro Command Center imobiliário
Reusa a estrutura de [`yzihub-command-center-v1.md`](../04-implementation/yzihub-command-center-v1.md) §3, com contexto do tenant:
- **Estado da operação:** carteira ativa, leads quentes, captações em aberto.
- **Próximas ações:** retomar lead do Bessa, responder proposta, agendar visita.
- **Recomendações da YZI:** priorizar imóvel parado de bom ticket, reativar frios de praia.
- **Oportunidades:** cards do Radar por bairro/lançamento (formato `radar-opportunity-card-v1.md`).
- **Financeiro resumido:** comissões previstas, despesa de anúncio.
- **Agenda:** visitas e calls do dia.
- **Conteúdos/campanhas:** hub "Morar no Bessa", campanha por tipologia.
- **Alertas:** oportunidade esfriando; **Créditos/uso**; **Auditoria** secundária.

### 4.7 Primeiras recomendações da YZI (exemplos)
- "Bairro **Bessa** em alta + 2 imóveis na carteira + 5 leads frios de praia → criar hub e reativar."
- "Imóvel parado de bom ticket → campanha segmentada por tipologia."
- "Lançamento detectado → preparar mensagem de captação à construtora (aguardando sua autorização)."

---

## 5. Dominação de território (eixo estratégico da vertical)

Como o YZI OS ajuda um corretor/imobiliária a **dominar território** — operacionalizando `radar-module-definition.md` §3 (arquitetura de conhecimento, não conteúdo solto):

1. **Detecta** bairros/regiões em alta (Radar Agent + `detect-neighborhood-demand`).
2. **Transforma bairro em estratégia:** cruza demanda com carteira, leads frios e concorrência (`score-territory-opportunity`).
3. **Cria arquitetura de conteúdo por bairro:** hub + spokes (`propose-neighborhood-content-hub`) — não posts avulsos.
4. **Sugere campanhas por bairro/tipologia** com intenção qualificada (`propose-property-campaign`).
5. **Reativa leads antigos por interesse territorial** (`identify-cold-leads` + `draft-lead-follow-up-message`).
6. **Identifica lançamentos e construtoras** captáveis (`detect-builder-or-development-signal` + `draft-builder-capture-message`).
7. **Acompanha resultado** e devolve a próxima ação (Relatórios + YZI).

**Exemplo encadeado:**
> Radar detecta alta em "apartamento no Bessa" → YZI cruza com 2 imóveis e 5 leads frios de praia → recomenda: criar hub **"Morar no Bessa"** + spokes (preço/m², praia, investimento, comparação com Manaíra), rodar campanha de teste, acionar leads frios, preparar mensagem de captação para o empreendimento relacionado → **cada ação sensível aguarda autorização**.

Cada saída vira um **Radar Opportunity Card** (`radar-opportunity-card-v1.md`): sinal + fonte + território + intenção + fit + ação + conteúdo + campanha + hub/spokes + próxima ação da YZI + flag de autorização.

---

## 6. Integrações futuras (maturidade V1–V3)

| Integração | Agente | Skill | Traz | Permite | Risco | Nível |
|---|---|---|---|---|---|---|
| CSV/Manual (imóveis, leads) | Orchestrator | `ingest-records-*` | carteira, leads | montar contexto | baixo | **V1** |
| Google Sheets | Orchestrator | `ingest-records-*` | dados vivos | sincronizar | baixo | V1 |
| Gmail / Workspace | Execution | `draft-*` | contexto de e-mail | rascunhar/enviar (autorizado) | médio | V1–V2 |
| Google Calendar | Execution | `schedule-visit-follow-up` | agenda | agendar visitas | baixo | V1–V2 |
| WhatsApp Business API | Execution | `draft-lead-follow-up-message` | conversas/leads | responder/retomar (autorizado) | alto | V2 |
| Instagram/Meta | Execution/Conteúdo | `propose-campaign` | presença | publicar (autorizado) | médio | V2 |
| Google Trends / demanda de busca | Radar | `detect-neighborhood-demand` | demanda regional | priorizar bairro | baixo | V2 |
| Search Console | Radar | `detect-*` | desempenho de busca | ajustar arquitetura | baixo | V2 |
| Google Ads | Execution | `propose-campaign` | desempenho | escalar/pausar (autorizado, c/ orçamento) | alto | V3 |
| Meta Ads + Ads Library | Execution/Radar | `propose-campaign`, `detect-builder-signal` | concorrência/anúncios | campanha + inteligência | alto | V3 |
| SERP provider | Radar | `detect-*` | disputa de mercado | leitura competitiva | médio | V3 |
| Portais imobiliários | Radar | `detect-launch-opportunity` | lançamentos/oferta | captação | médio–alto | V3 |
| CRM existente | Orchestrator | `ingest-records-*` | base atual | migrar contexto | médio | V2–V3 |
| Construtoras / sites de lançamento | Radar | `detect-builder-signal` | lançamentos | captação parceira | alto | V3 |

Coerente com `radar-module-definition.md` §4: **níveis são maturidade, não estado atual** — não prometer V2–V3 como prontos.

---

## 7. Governança na ativação

- Conexão de canal e importação de dados pedem **autorização explícita**.
- Toda mensagem a lead/construtora e toda campanha paga: **aprovação humana**; campanha paga exige **limite de orçamento**.
- Nada de inventar imóvel, disponibilidade ou parceria; **não prometer rentabilidade**; cuidado com dados pessoais.
- Estados honestos de execução e **rastro** de toda ação (modelo §8).
- A YZI mostra **o que vai fazer antes** e **o que fez depois**.

---

## 8. Critério de pronto da ativação

A ativação está pronta quando:
- O tenant tem **perfil, território e contexto** configurados.
- O **Command Center inicial** mostra estado + próximas ações + recomendações (não dashboard vazio).
- A **YZI tem presença viva** e já fez ao menos uma **leitura priorizada**.
- Existem **primeiras oportunidades/recomendações** coerentes com o segmento.
- As **integrações mínimas** do plano estão conectadas ou claramente pendentes (status honesto).
- O usuário **entende a prioridade do dia** ao abrir.
- Nada parece CRM puro, dashboard vazio ou painel técnico.

> Modelo de agentes/skills/governança que sustenta este fluxo: [`agents-and-skills-operating-model.md`](./agents-and-skills-operating-model.md).
