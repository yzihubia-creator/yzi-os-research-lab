# Decisão — Reposicionamento do Módulo Radar (v1)

**Data:** 2026-06-15
**Status:** Ativa
**Escopo:** Definição e posicionamento do módulo Radar e seu efeito sobre Conteúdo IA, Tráfego Pago, Relatórios/Recomendações, YZI e plano Growth.

---

## 1. Decisão tomada

Reposicionar o Radar de "inteligência de mercado / tendências" (leitura rasa) para **módulo de inteligência de demanda, busca, mercado e oportunidade** do YZI OS, definido em [`../02-modules/radar-module-definition.md`](../02-modules/radar-module-definition.md).

A unidade do Radar passa a ser a **oportunidade acionável priorizada** — sinal + fonte + intenção + fit + ação + conteúdo + campanha + silo/hub/spokes + impacto + próximo passo da YZI.

---

## 2. Por que foi necessária

O verbete de Radar em `module-map.md` o descrevia de forma genérica ("tendências", "sinais externos"), com risco de virar Google Trends embutido ou feed sem ação. A leitura do material de silos semânticos mostrou que **conteúdo solto não vence — arquitetura de conhecimento (hub/spokes), autoridade temática e monitoramento contínuo vencem**. Isso eleva o Radar de "detector de tendência" para "motor de oportunidade que já entrega a arquitetura de captura", protegendo a verba de tráfego e conteúdo de decisões por achismo.

---

## 3. O que passa a ser autoridade

- A definição do Radar em `radar-module-definition.md`: promessa, fontes por nível (V1–V4), tipos de oportunidade, formato da oportunidade, casos por nicho e regra do módulo.
- O princípio de **arquitetura antes de volume**: Conteúdo IA produz hub/spokes (silos), não posts avulsos; Tráfego Pago parte de intenção qualificada pelo Radar; Relatórios fecham o ciclo em recomendação.
- O Growth deixa de ser "mais módulos" e passa a ser **plano de inteligência de oportunidade e execução contínua**: Radar + Conteúdo IA + Tráfego Pago + YZI Execution + Recomendações contínuas.

---

## 4. O que fica proibido

- Posicionar o Radar como Google Trends embutido, feed de tendências ou dashboard de keywords cru.
- Entregar sinal sem ação recomendada e sem arquitetura (hub/spokes) sugerida.
- Tratar conteúdo como peças avulsas em vez de silos semânticos.
- Vender Growth como "quantidade de módulos" em vez de inteligência de oportunidade + execução.
- Prometer fontes externas (V2–V4) como já implementadas — são níveis de maturidade, não estado atual.

---

## 5. Impacto nos demais módulos

- **Conteúdo IA:** organiza-se por silos (1 hub + 5–15 spokes, coesão semântica, linkagem interna), não por posts soltos.
- **Tráfego Pago:** recebe do Radar a intenção qualificada e a localidade antes do gasto.
- **Relatórios e Recomendações:** consomem o desempenho de silos/campanhas e devolvem a próxima oportunidade.
- **YZI Assistant:** lê o Radar e prepara/executa a próxima ação dentro de créditos, permissões e escopo.
- **Growth Plan:** reposicionado como inteligência de oportunidade + execução contínua.

---

## 6. Próximos documentos permitidos

- Eventual atualização do verbete *Radar* em `02-modules/module-map.md` para apontar para esta definição (não feita agora; preferiu-se documento novo).
- Eventual nota futura sobre Conteúdo IA por silos e sobre o reposicionamento do Growth, se a evolução do produto justificar.

Nada fora de `docs/yzi-os-active/` sem autorização explícita.

---

## 7. Como esta decisão protege o projeto

Impede que o Radar regrida para "tendências genéricas" e que o Growth seja vendido como pilha de módulos. Ancora o diferencial na **arquitetura de oportunidade e execução contínua** — coerente com o núcleo decisão + ação contínua e com o papel da YZI como motor que cruza módulos.
