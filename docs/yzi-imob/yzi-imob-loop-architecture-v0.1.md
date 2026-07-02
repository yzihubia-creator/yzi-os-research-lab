# YZI IMOB — Arquitetura de Loops v0.1

## 1. Princípio

YZI IMOB não é apenas uma coleção de telas. YZI IMOB opera por loops comerciais: imóvel entra; YZI prepara o ativo comercial; orgânico e Ads geram demanda; WhatsApp recebe o lead; YZI atende, qualifica e agenda; corretor atua quando necessário; venda ou perda é registrada; o sistema aprende; o próximo imóvel sai melhor.

## 2. Loop principal do imóvel

`Imóvel cadastrado → Página/Silo/Criativos/Campanha → Lead → WhatsApp → Qualificação → Agendamento → Venda/Perda → Aprendizado`

## 3. Quatro loops internos

| Loop | Trigger | Execução | Verificação | State |
|---|---|---|---|---|
| 1 — Imóvel → Página/Silo/Criativos/Campanha | novo imóvel cadastrado; novas fotos/vídeos enviados; imóvel atualizado | analisar tipo, bairro, valor, diferenciais, mídia e público provável; definir silo orgânico; preparar página do imóvel; gerar copy, posts, criativos e campanha assistida | imóvel tem dados mínimos? tem fotos? tem página? tem silo? tem criativos? tem plano de anúncio? | registrar status da pasta comercial; registrar entregáveis gerados; registrar pendências e aprovações |
| 2 — Lead → Atendimento/Qualificação/Agendamento | lead chegou pelo WhatsApp; lead respondeu campanha; lead veio do site; lead voltou após follow-up | YZI atende pelo WhatsApp; entende o que a pessoa procura; qualifica intenção, orçamento, região, prazo e tipo de imóvel; sugere caminho; agenda visita ou aciona corretor | lead foi respondido? lead foi qualificado? existe imóvel compatível? visita foi marcada? corretor foi acionado? | registrar conversa; registrar origem; registrar etapa do lead; registrar interesse; registrar próxima ação |
| 3 — Venda/Perda → Métrica/Aprendizado/Recomendação | imóvel vendido; lead perdido; visita sem retorno; campanha encerrada; imóvel parado | analisar origem do lead; analisar página, silo, criativo, copy, campanha e atendimento; identificar o que funcionou; identificar gargalos; gerar recomendação para próximos imóveis | houve venda? houve visita? houve proposta? houve lead qualificado? qual canal gerou melhor resultado? qual criativo performou melhor? | registrar resultado; registrar motivo de venda/perda; registrar canal vencedor; registrar aprendizado reutilizável |
| 4 — DevOps → Logs/Monitoramento/Correções/Disponibilidade | erro de integração; falha no WhatsApp; falha no site; campanha sem tracking; webhook/API instável; queda de disponibilidade | registrar logs; identificar falha; sinalizar risco operacional; gerar ação técnica; manter site, domínio, WhatsApp, integrações e tracking funcionando | site está online? WhatsApp está operacional? tracking está funcionando? integrações estão respondendo? logs estão sendo registrados? | registrar incidentes; registrar correções; registrar status operacional; registrar dependências técnicas |

## 4. Tradução comercial

A linguagem interna deste documento é loop/state/verification — ela não vai para o cliente. Para cliente, a tradução comercial é:

- A YZI aprende com cada imóvel vendido.
- O YZI IMOB coloca inteligência antes da verba.
- O orgânico constrói autoridade. O Ads escala a oferta. O WhatsApp converte a demanda.
- Todo imóvel precisa virar página, criativo, campanha e conversa no WhatsApp.

Termos como loop engineering, agentic workflow, harness, state machine, multi-agent runtime e AI-first operational dashboard não aparecem na linguagem comercial — existem só como arquitetura interna.

## 5. Regra de produto

Nenhum imóvel deve ser tratado como item isolado. Cada imóvel é uma unidade comercial rastreável com: página; silo; mídia; criativos; campanha; atendimento; lead; agendamento; venda/perda; aprendizado.
