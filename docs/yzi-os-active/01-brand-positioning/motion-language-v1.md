# YZI OS — Linguagem de Motion (v1)

> **Deriva de [`DESIGN.md`](./DESIGN.md) e [`component-language-v1.md`](./component-language-v1.md).** Define quando o YZI OS usa motion, quando não usa, quais eventos merecem movimento e quais anti-padrões são proibidos. Fonte ativa.
> **Não é implementação:** sem código, CSS, Tailwind, biblioteca instalada, Pencil/`.pen` ou MCP. Tom prático para IA/dev/designer — não define API nem biblioteca obrigatória.

---

## 1. Propósito

Motion no YZI OS é **linguagem de estado, continuidade e confiança** — não decoração. Existe para mostrar que o sistema observa, pensa, recomenda, executa e acompanha.

## 2. Regra central

Motion existe para mostrar que o sistema está: **observando · pensando · recomendando · aguardando autorização · executando · monitorando · alertando · aprendendo continuidade.** Se o movimento não comunica **estado, prioridade ou confiança**, não deve existir.

## 3. O que motion NÃO é

Não é efeito de landing page · não é parallax decorativo · não é bounce infantil · não é UI gamer · não é dashboard futurista vazio · não é brilho gratuito · não é animação "para parecer moderno".

## 4. Princípios de motion

Sutileza · calma · precisão · continuidade · honestidade de estado · prioridade visual · redução de ansiedade · feedback claro · **zero espetáculo**.

## 5. Eventos que merecem motion

- Novo sinal detectado no Radar.
- Nova recomendação da YZI.
- Opportunity Card mudando de estado.
- Ação entrando em autorização.
- Autorização concedida.
- Execução iniciada.
- Execução concluída.
- Alerta crítico.
- Ativo indexado.
- Busca semântica retornando resultado.
- Resultado entrando em monitoramento.
- Audit Drawer abrindo sob demanda.

## 6. Radar Motion

- A Radar Surface deve parecer **viva, mas calma**.
- Bairros/territórios podem ter **aquecimento sutil**.
- Sinais novos entram com **destaque breve**.
- Oportunidade nova **emerge sem roubar a tela**.
- **Nunca:** gráfico pulando, efeito financeiro/gamer.

## 7. Opportunity Card Motion

Transições que deixam claro **o que mudou e por quê**:
`detectada → recomendada` · `recomendada → aguardando autorização` · `aguardando autorização → autorizada` · `autorizada → executando` · `executando → executada` · `executada → monitorando` · `qualquer → bloqueada/descartada`. Cada mudança é legível, nunca silenciosa nem abrupta.

## 8. YZI Presence Motion

- A YZI aparece como **presença discreta**; recomendações **entram suavemente**.
- **Não** usar pop-up intrusivo.
- **Não** simular "chat digitando" como padrão.
- O motion da YZI deve parecer **assistência confiável**, não atendimento animado.

## 9. Action Queue Motion

- Ações podem **reordenar com transição clara**.
- Item aguardando autorização tem **atenção controlada**.
- Ação executada **sai para monitoramento sem desaparecer abruptamente**.
- **Nunca** animação que esconda a consequência.

## 10. Authorization Motion

- Autorização é **estável e deliberada**.
- Botões **não induzem clique impulsivo**.
- Transição para `autorizado`/`executando` **confirma a consequência**.
- `recusado`/`editado` deve ser **claro**.

## 11. Asset Intelligence Motion

- Ingestão mostra **progresso honesto**: `indexando → entendido → ligado a oportunidade`.
- Busca semântica mostra **continuidade de raciocínio**, não loading genérico.
- Ativo entendido pode **revelar próximos usos**.

## 12. Alert Motion

- **Informativo:** entrada discreta, sem insistência.
- **Atenção:** destaque moderado, persiste até ser visto.
- **Crítico:** chama atenção de forma controlada e exige decisão — **nunca parece erro de sistema** se for oportunidade operacional.
- **Bloqueado:** claro e estável, comunica que algo está retido.

## 13. Audit Drawer Motion

- Abre **sob demanda**, com motion **discreto**.
- **Nunca protagonista.**
- A entrada **reforça rastreabilidade e confiança**.

## 14. Timing e intensidade conceitual

Sem números rígidos: **rápido** para feedback · **moderado** para mudança de estado · **calmo** para painel/drawer · **persistente apenas** para alerta que exige decisão. Toda animação **termina** — nunca fica chamando atenção eternamente.

## 15. Componentes com motion permitido

Radar Surface · Opportunity Card · Territory Map · Signal Badge · Action Queue · Authorization Panel · YZI Recommendation Panel · Semantic Search Box · Asset Intake Card · Status Badge · Audit Drawer.

## 16. Componentes que não devem "dançar"

App Shell, navegação, textos longos, tabelas e métricas estáveis **não animam sem evento real**.

## 17. Motion + Pencil

Futuros protótipos Pencil/`.pen` podem **representar intenção de motion em notas**. Pencil **não substitui** a implementação de motion. `.pen` só **depois** da linguagem visual e de componentes. **Não criar `.pen` agora.**

## 18. Motion + implementação futura

`motiondivision/motion` pode ser **avaliado** na implementação futura — **não é dependência obrigatória agora**. Qualquer biblioteca deve **obedecer este documento**. Motion em código só **depois** de validação visual e autorização de implementação.

## 19. Anti-padrões

Animação decorativa · pulso infinito sem urgência real · shimmer excessivo · loader genérico eterno · transição que esconde mudança · animação que induz clique · alerta que parece bug · YZI parecendo chatbot animado · mapa gamer · card pulando sem motivo.

## 20. Próximo passo recomendado

Criar **depois** (não agora): `docs/yzi-os-active/04-implementation/real-estate-command-center-v1.md` — ou, se decidirmos prototipar antes, `docs/yzi-os-active/04-implementation/real-estate-command-center-pencil-plan-v1.md`. Nada fora de `docs/yzi-os-active/` sem autorização explícita.
