# YZI OS — Simulação da Primeira Vertical Imobiliária (v1)

**Fonte ativa.** Aplica, em forma de simulação, [`../05-decisions/decision-real-estate-first-vertical-v1.md`](../05-decisions/decision-real-estate-first-vertical-v1.md), [`../03-architecture/ai-first-tenant-activation-flow.md`](../03-architecture/ai-first-tenant-activation-flow.md), [`../03-architecture/agents-and-skills-operating-model.md`](../03-architecture/agents-and-skills-operating-model.md), [`yzihub-command-center-v1.md`](./yzihub-command-center-v1.md) e [`radar-opportunity-card-v1.md`](./radar-opportunity-card-v1.md).

> Documento de arquitetura/simulação. **Não** implementa nada: sem código, schema, SQL, API, MCP, evidence ou lane. O imobiliário em João Pessoa é **exemplo de validação**, não vertical do core — o YZI OS permanece horizontal.

---

## 1. Objetivo da simulação

Mostrar, com um caso concreto, como o YZI OS transforma **ativos internos desorganizados + sinais externos de demanda** em **oportunidades acionáveis**. É simulação: ilustra o fluxo e os componentes sem transformar o núcleo (decisão + ação contínua) em produto imobiliário.

## 2. Personagem da simulação — Pitanga Imobiliária

A **Pitanga Imobiliária** atua em João Pessoa. Quer **vender mais**, **captar melhor** e **dominar bairros estratégicos** (Bessa, Cabo Branco, Manaíra, Altiplano, Bancários). Tem muitos dados — mas espalhados, fora de qualquer inteligência operacional.

## 3. Antes do YZI OS

Ativos vivos, porém mortos para a decisão: planilhas de imóveis; fotos em pastas do Drive; PDFs de lançamentos; materiais de construtoras; leads antigos; conversas de WhatsApp; contatos de proprietários; bairros de atuação; histórico comercial; imóveis parados; materiais de campanha; anotações soltas de corretores. Resultado: decisões por intuição, tráfego sem inteligência, dificuldade de saber **onde agir**.

## 4. Entrada no YZI OS

Fluxo IA-first (`ai-first-tenant-activation-flow.md` §2): a Pitanga entra no YZI OS → conversa com a YZI (diagnóstico, não papo) → informa objetivo → conecta/importa ativos → seleciona bairros prioritários → define plano (Start/Pro/Growth) → recebe o **Command Center inicial** montado (sem cair em dashboard vazio).

## 5. Asset Intake & Semantic Index

A **Camada de Ingestão e Indexação Semântica** recebe os ativos espalhados e os transforma em ativos estruturados, busca semântica e contexto operacional cruzável com o Radar: imóveis, fotos, leads, materiais de lançamento, proprietários, terrenos, bairros, construtoras, conversas e histórico comercial.

Buscas semânticas que passam a ser possíveis:
- "apartamentos no Bessa até 600 mil"
- "leads antigos interessados em praia"
- "imóveis com varanda gourmet no Altiplano"
- "proprietários que falaram em vender terreno"
- "materiais de lançamento em Cabo Branco"
- "imóveis parados com boa comissão"

## 6. Radar de oportunidades

O Radar (`radar-module-definition.md`) cruza **ativos internos indexados + sinais externos de demanda + território + intenção + timing + capacidade de execução** e devolve **oportunidades priorizadas** — não um feed de tendências nem um Google Trends embutido.

## 7. Tipos de oportunidade imobiliária

- **Compra** — imóvel/terreno com fit para um comprador conhecido.
- **Venda** — imóvel da carteira com demanda aquecida.
- **Captação** — bairro com pouca oferta interna e procura alta.
- **Reativação** — lead frio ligado a uma tendência atual.
- **Lançamento** — empreendimento novo captável.
- **Conteúdo** — hub/spokes para dominar um tema/bairro.
- **Campanha** — teste segmentado por bairro/tipologia.
- **Comissão** — imóvel parado de bom ticket a priorizar.
- **Parceria/construtora** — abordagem de captação conjunta.

## 8. Exemplos práticos de oportunidades

**Exemplo 1 — Bessa aquecendo**
Sinal: busca por apartamento no Bessa subindo. Ativos: 4 imóveis compatíveis + 27 leads antigos. YZI recomenda: hub "Morar no Bessa", campanha teste, follow-up com os leads frios.

**Exemplo 2 — Manaíra com pouca oferta**
Sinal: demanda aquecida, baixa oferta interna em Manaíra. Ativos: poucos imóveis na carteira. YZI recomenda: campanha "quer vender seu imóvel em Manaíra?" + captação de proprietários.

**Exemplo 3 — Lançamento em Cabo Branco**
Sinal: lançamento detectado em Cabo Branco. Ativos: PDF da construtora no Drive + leads interessados em praia. YZI recomenda: preparar abordagem de captação/parceria e conteúdo de lançamento.

**Exemplo 4 — Imóvel parado de alta comissão**
Sinal: imóvel parado com comissão alta. Ativos: boas fotos + lead antigo compatível. YZI recomenda: reativação e campanha segmentada.

## 9. Command Center da Pitanga

Reusa a estrutura de `yzihub-command-center-v1.md` §3 com contexto do tenant. Blocos:
estado da operação · territórios prioritários · oportunidades do Radar · leads para reativar · imóveis em destaque · captações sugeridas · campanhas/conteúdos recomendados · agenda · financeiro/comissões · ações aguardando autorização · resultados · auditoria secundária (drawer).

## 10. Radar Surface visual

O Radar não é texto gigante nem Google Trends. É uma **experiência visual contínua**: mapa de território · bairros aquecendo · cards de oportunidade · fila de ações · sinais por fonte (nível V1–V4) · potencial de receita/comissão · status de execução · impacto acompanhado.

## 11. Ações da YZI

A YZI pode **preparar**: rascunhar mensagem para lead; rascunhar mensagem para proprietário; preparar abordagem para construtora; sugerir campanha; criar briefing de conteúdo; sugerir página/hub por bairro; criar tarefa para corretor; recomendar priorização de imóvel; abrir relatório.

> Toda ação real passa pela **camada de governança** e exige **autorização explícita** (`agents-and-skills-operating-model.md` §8). A YZI mostra o que vai fazer antes e o que fez depois (rastro).

## 12. O que é reutilizável para outras verticais

Componentes horizontais derivados aqui: Asset Intake · Semantic Search · Radar Surface · Opportunity Cards · Territory/Segment Map · Action Queue · Authorization Layer · Command Center · Reflective Memory · Trace · Content/Campaign Engine.

## 13. Relação futura com campanha política

A mesma lógica vira: território + pauta + percepção + base de contatos + agenda + conteúdo + ação autorizada. **Não criar campanha política agora.**

## 14. Relação futura com Café com Pam

A mesma lógica vira: fotos + briefings + referências + leads + orçamentos + conteúdo + consultoria. **Não retomar Café com Pam agora.**

## 15. O que NÃO significa

- Não transformar o core em imobiliário.
- Não implementar ainda; não criar API, schema ou tecnologia final.
- Não prometer integrações prontas; não criar dashboard técnico.
- Não transformar o Radar em Google Trends.
- Não criar 20 agentes (núcleo pequeno: Orchestrator + Radar + Execution).
- Não mexer no sistema atual do Café com Pam.

## 16. Próximo passo recomendado

Se autorizado **depois** (não agora): `real-estate-command-center-v1.md`, detalhando o Command Center da vertical imobiliária. Nada fora de `docs/yzi-os-active/` sem autorização explícita.
