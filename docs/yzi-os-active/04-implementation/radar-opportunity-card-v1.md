# YZI OS — Radar Opportunity Card V1

**Fonte ativa.** Alinhado a [`yzihub-command-center-v1.md`](./yzihub-command-center-v1.md) (bloco *4. Oportunidades*), [`../02-modules/radar-module-definition.md`](../02-modules/radar-module-definition.md) e [`../05-decisions/decision-radar-positioning-v1.md`](../05-decisions/decision-radar-positioning-v1.md). Não define schema, UI final, design tokens, integrações nem código.

---

## 1. Objetivo do componente

O **Radar Opportunity Card** é a **unidade mínima de oportunidade** detectada pelo Radar dentro do Command Center. Ele transforma um sinal de demanda/mercado em **decisão + ação contínua** visível para o gestor — coerente com o núcleo do YZI OS e com o papel do Radar como motor de oportunidade, não feed de tendências.

---

## 2. O que o card precisa provar

- Que o Radar **não é gráfico de tendência** — é oportunidade com ação.
- Que o sinal **vira decisão e ação**, não relatório.
- Que a **YZI interpreta o sinal** (não joga dado cru na tela).
- Que a oportunidade **conecta Conteúdo IA, Tráfego Pago, CRM/Follow-ups e Relatórios**.
- Que o gestor **entende o que fazer sem ser especialista** em SEO/tráfego.

---

## 3. Estrutura do card (campos obrigatórios)

| Campo | O que comunica |
|---|---|
| **Título da oportunidade** | resumo humano e direto |
| **Tipo de oportunidade** | categoria (ver §4) |
| **Sinal detectado** | o que mudou/cresceu |
| **Fonte do sinal** | de onde veio (com nível V1–V4 / seed) |
| **Localidade/contexto** | onde se aplica |
| **Intenção de busca** | o que a pessoa quer ao procurar |
| **Força do sinal** | volume/tendência/crescimento |
| **Urgência** | janela de tempo para agir |
| **Concorrência** | quão disputado está |
| **Fit com a empresa** | aderência ao que ela vende/executa |
| **Ação recomendada** | o próximo passo comercial |
| **Conteúdo recomendado** | peça(s) a criar |
| **Campanha recomendada** | teste/segmentação sugerida |
| **Hub/silo/spokes recomendados** | arquitetura de captura (quando aplicável) |
| **Módulo de execução** | onde a ação acontece |
| **Status** | estado do card (ver §5) |
| **Próxima ação da YZI** | o que a assistente prepara/executa |
| **Necessidade de autorização** | se exige aprovação humana |
| **Rastro/evidência resumida** | base do sinal, em 1 linha (detalhe no drawer) |

> Sem **ação recomendada** + **próxima ação da YZI**, não é card de oportunidade — é só dado.

---

## 4. Tipos de oportunidade

`conteúdo` · `tráfego pago` · `SEO/silo` · `regional/local` · `captação` · `reativação de leads` · `lançamento/produto` · `parceria` · `ajuste de oferta`.

---

## 5. Estados do card

`detectada` → `em análise pela YZI` → `recomendada` → `aguardando autorização` → `ajustada pelo humano` → `enviada para execução` → `executada` → `monitorando resultado` · (a qualquer momento) `descartada`.

O status é honesto: deixa claro quando o card é **seed controlado** ou **preview**, e quando depende de autorização.

---

## 6. Ações possíveis

`criar conteúdo` · `criar campanha` · `criar hub/silo` · `criar tarefa` · `acionar lead antigo` · `preparar mensagem para parceiro/construtora` · `ajustar oferta` · `abrir relatório` · `descartar oportunidade`.

Cada ação aponta para um **módulo de execução** (Conteúdo IA, Tráfego Pago, CRM/Follow-ups, Calendário, Relatórios) e respeita créditos/permissões.

---

## 7. Exemplos concretos

**Imobiliária / corretor — bairro em alta (João Pessoa)**
- *Sinal:* busca por "apartamento no Bessa" crescendo no mês.
- *YZI:* "Demanda subindo no Bessa e temos 2 imóveis na carteira + 5 leads frios da região."
- *Ação recomendada:* criar hub "Morar no Bessa" + reativar leads + campanha por tipologia.
- *Módulo de execução:* Conteúdo IA + Tráfego Pago + CRM/Follow-ups.

**Clínica odontológica / médica — procedimento em alta**
- *Sinal:* aumento de buscas por "clareamento dental" na cidade.
- *YZI:* "Procedimento de boa margem em alta e agenda de quinta ociosa."
- *Ação recomendada:* campanha de captação + spoke de dúvidas + recall de inativos.
- *Módulo de execução:* Tráfego Pago + Conteúdo IA + Follow-ups.

**Barbearia — agenda ociosa + tendência**
- *Sinal:* corte específico em alta nas redes; terças com baixa ocupação.
- *YZI:* "Tendência captável e janela ociosa para preencher."
- *Ação recomendada:* oferta para terça + post do serviço em alta.
- *Módulo de execução:* Conteúdo IA + Follow-ups.

**Loja com estoque — produto em alta / encalhe**
- *Sinal:* produto X procurado e em estoque; produto Y parado.
- *YZI:* "Anuncie o que gira; queime o encalhe com oferta."
- *Ação recomendada:* campanha do produto em alta + oferta de recompra do parado.
- *Módulo de execução:* Tráfego Pago + CRM/Follow-ups.

---

## 8. Comportamento visual

Alinhado ao Command Center (estratégico, premium, escuro, denso de sentido):

- Card **estratégico, não técnico**.
- Mostra **"por que isso importa"** e **"o que fazer agora"**.
- **Evidência resumida** (1 linha) na face; detalhes técnicos em **expansão/drawer**.
- **Status honesto**: preview, seed controlado, aguardando autorização.
- Peso visual conforme importância — não vira mural de cards iguais.

---

## 9. O que NÃO deve virar

Tabela de keywords · painel do Google Trends · print de SERP · dashboard de gráfico · gerador de post solto · recomendação sem ação · alerta sem prioridade · SEO técnico como protagonista.

---

## 10. Ponte para implementação futura

> Direcional. Não autoriza por si só código, schema ou UI final.

- **Onde aparece:** no bloco *4. Oportunidades* do Command Center; recomendações ligadas ao card surgem também no bloco *3. Recomendações da YZI*; rastro vai para o *audit drawer* (bloco 11).
- **Conexão com o seed atual:** entra como parte das **3 oportunidades** do seed mínimo da YZIHUB (Command Center §5) — neutras da YZIHUB, nunca vertical de cliente.
- **Dados seed necessários:** por card — título, tipo, sinal, fonte (nível/seed), localidade, intenção, força, urgência, concorrência, fit, ação recomendada, conteúdo/campanha/silo sugeridos, módulo de execução, status, próxima ação da YZI, flag de autorização e evidência resumida.
- **Componentes prováveis:** `OpportunityCard` (face + drawer), `status badge`, `action buttons` por módulo, integração com `recommendation cards` e `assistant panel`, `empty state` ("Nenhuma oportunidade ativa").
- **Primeiro prompt de implementação futura sugerido:**
  > "Implementar o Radar Opportunity Card no bloco Oportunidades do Command Center: face estratégica (por que importa + o que fazer agora + status honesto) e drawer com evidência resumida, consumindo cards do seed mínimo da YZIHUB, com ações que apontam para o módulo de execução e pedido de autorização quando sensível. Sem tabela de keywords nem painel de Trends." — a ser executado em etapa própria, com escopo técnico definido então.
