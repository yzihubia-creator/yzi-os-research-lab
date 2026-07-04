# YZI IMOB — Capability Graph v1

Mapa institucional do produto: como as capabilities colaboram para operar uma imobiliária. Não descreve Runtime, banco, APIs ou telas. O Execution Pack (`docs/yzi-imob/execution-pack/`) permanece a única fonte de verdade do Runtime; a Operating Surface (`yzi-imob-product-operating-surface-v1.md`) permanece a única fonte de verdade da experiência do gestor.

## 1. Princípio

**O Runtime pensa.** Classifica intenção, seleciona workflow, aplica policy, monta o menor contexto útil, para em aprovação — e é invisível ao gestor.

**As capabilities resolvem problemas de negócio.** Cada uma nasce da pergunta *"qual problema operacional do gestor ela resolve?"* — nunca de "qual funcionalidade implementa".

**A Operating Surface apresenta o negócio.** O gestor vê estado, leitura e decisão — nunca tecnologia.

**A YZI coordena toda a operação.** É a entidade operacional que prepara, recomenda, encaminha e aguarda o humano nas decisões sensíveis.

## 2. Capability Graph

Capabilities aprovadas: **Property Catalog** (ciclo de vida do imóvel) · **Creative Studio** · **Visit Orchestration** · **Lead Intelligence** · **Assignment Engine**. Tráfego, Atendimento, Pipeline Comercial e Radar aparecem como **estágios operacionais** (módulos da Operating Surface e capabilities futuras) — não são capabilities especificadas e não são criadas aqui.

```
Property Catalog ──(Creative Brief)──► Creative Studio ──(criativo aprovado)──► [Tráfego]
                                                                                    │ (lead com UTM)
                                                                                    ▼
                                                                              [Atendimento]
                                                                                    │ (lead a distribuir)
                                                                                    ▼
                                                                             Assignment Engine
                                                                                    │ (corretor recomendado)
                                                                                    ▼
                                                                            Visit Orchestration
                                                                                    │ (visita confirmada)
                                                                                    ▼
                                                                           [Pipeline Comercial]
                                                                                    │ (desfecho: venda/perda)
                                                                                    ▼
                                                                             Lead Intelligence
                                                                                    ├──► [Radar] (sinais)
                                                                                    ├──► Search Intelligence → Site/conteúdo (pautas)
                                                                                    ├──► Creative Studio (workflow criativo preferencial)
                                                                                    ├──► Assignment Engine (score histórico)
                                                                                    └──► [Tráfego] (ajuste de campanha)
```

Cada seta é um contrato de entrega (seção "Próxima Capability" da spec correspondente): nenhuma capability termina nela mesma. Onde cada uma começa e termina: Property Catalog começa no cadastro do corretor e termina no Creative Brief; Creative Studio começa no Brief e termina no criativo aprovado com evidence; Assignment Engine começa no lead a distribuir e termina na recomendação explicada; Visit Orchestration começa na intenção de visita e termina na visita confirmada com agenda e Kanban consistentes; Lead Intelligence começa nos dados/desfechos e termina em recomendações — nunca em execução.

## 3. Feedback Loops

O produto aprende continuamente porque a última capability alimenta as anteriores:

- **Lead Intelligence → Creative Studio** — que formato/ângulo converte por tipo de imóvel e público.
- **Lead Intelligence → Assignment Engine** — score histórico por corretor/perfil de lead; overrides do gestor viram aprendizado (Override Learner).
- **Lead Intelligence → Radar** — padrões viram sinais de oportunidade/risco fundamentados.
- **Lead Intelligence → Tráfego** — origem × conversão vira recomendação de escalar/pausar/realocar.
- **Lead Intelligence → Search Intelligence → Site** — intenção de busca recorrente vira pauta e silo orgânico.
- **Visit Orchestration → Assignment Engine** — resultado da visita realimenta o score do corretor.
- **Property Catalog → Lead Intelligence** — imóvel/bairro/faixa são dimensões de padrão.

Toda recomendação de loop carrega confidence + evidence + volume analisado; sem volume, o estado honesto é `insufficient_data`.

## 4. Human-in-the-loop

A YZI **recomenda e prepara em todo o grafo**; **executa nada sensível sozinha**. Pontos de aprovação humana (via Approval Queue, por referência ao Execution Pack):

- **Property Catalog** — publicar página do imóvel (Publish Gate).
- **Creative Studio** — todo criativo passa por QA e aprovação humana antes de qualquer uso; Lançamento sempre exige aprovação.
- **Tráfego** (estágio) — criar/enviar/alterar campanha e orçamento.
- **Assignment Engine** — aplicação automática só quando a política do tenant permite; caso contrário, confirmação humana; override sempre registrado.
- **Visit Orchestration** — confirmação da visita conforme política do tenant; contato proativo com cliente é sensível.
- **Lead Intelligence** — apenas recomenda; aceitar/ignorar é sempre decisão humana.

Toda capability produz **Evidence** — o que foi visto, preparado, decidido, por quem e quando. Sem evidence, nada avança para o estágio seguinte.

## 5. Learning Loop

```
Knowledge → Context Builder → Runtime → Capabilities → Evidence → Lead Intelligence → Memory → Knowledge
```

O conhecimento do tenant entra no menor contexto útil (Context Builder); o Runtime decide o workflow; as capabilities operam e produzem evidence; a Lead Intelligence transforma evidence em padrões e recomendações; o que o humano valida vira Memory; a Memory consolidada vira Knowledge que melhora o próximo ciclo. O sistema melhora continuamente **sem quebrar o Tenant Boundary**: todo aprendizado pertence a um `tenant_id`; nenhum padrão de um tenant vaza para outro; o Runtime nunca monta conhecimento permanente — quem consolida aprendizado é o ciclo Evidence → Memory, sempre por tenant.

## 6. Operating Surface × Capabilities

Dependências (não telas):

- **Home (Operating Briefing)** — consome Lead Intelligence (leituras), Radar (sinais), Assignment Engine (distribuição pendente), Creative Studio (aprovações pendentes), Tráfego (estado de campanhas).
- **Imóveis** — consome Property Catalog (estado de prontidão, completude, publicação).
- **Clientes** — consome Lead Intelligence (perfil/estágio) e Pipeline Comercial (negociações).
- **Atendimento** — consome Assignment Engine (corretor recomendado) e Visit Orchestration (agendamento na conversa).
- **Creative Studio (módulo)** — consome Creative Studio Capability (fila de geração, QA e aprovação).
- **Tráfego (módulo)** — consome Lead Intelligence (recomendações de campanha) e criativos aprovados do Creative Studio.
- **Radar (módulo)** — consome Lead Intelligence (sinais fundamentados).
- **Operação** — consome o estado das conexões por categoria de provider (detalhe de implementação, nunca identidade).
- **Configurações** — não consome capability operacional; define políticas que todas respeitam (Visit Policy, política de assignment, limites de aprovação).

## 7. Princípios Arquiteturais

1. Runtime é invisível ao gestor.
2. Providers nunca definem uma capability.
3. Toda capability prepara outra capability.
4. Toda decisão sensível permanece humana.
5. Toda recomendação é explicável.
6. Toda capability resolve um problema operacional.
7. Toda capability produz Evidence.
8. Context Builder nunca executa.
9. Runtime nunca monta conhecimento permanente.
10. Operating Surface nunca expõe tecnologia.

## 8. Escopo

Não cria capabilities, código, SQL, APIs, UI ou integrações; não altera Runtime, Execution Pack, Context Builder ou Tool Registry. Mapa institucional do produto — base para a próxima fase (Capability Composition + UX Composition).
