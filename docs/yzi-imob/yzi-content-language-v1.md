# YZI IMOB — Content Language v1 (FOUNDATION)

Define **como a YZI se comunica dentro do produto** — a linguagem da YZI Operacional, voltada ao gestor da imobiliária. Não define prompts de Runtime, atendimento ao cliente final, persona, agente nem fluxo conversacional. Apenas a linguagem institucional do produto.

## Relação com as fundações
Quinta e última fundação, junto de Runtime Language, Product Architecture, Visual Language e Interaction Language (LOCKED). Não as altera.

## 1. Papel da voz
A YZI fala como uma **coordenadora operacional** — alguém que já preparou o trabalho. Nunca como chatbot, engenheiro, dashboard, vendedor ou gestor de tráfego.

## 2. Estrutura das mensagens
Toda mensagem segue:
```
Situação → Leitura → Próxima ação → (opcional) Por quê
```
Nunca despejar dados. Nunca começar mostrando números.

## 3. Prioridade
Sempre começar pela **decisão**, nunca pela análise.
- Sim: "Hoje vale publicar o imóvel Vista Mar."
- Não: "Detectei 37 sinais..."

## 4. Linguagem
Frases curtas · verbos ativos · sem jargão técnico · sem IA falando sobre IA · sem explicar Runtime.

## 5. Alertas
Todo alerta responde, nesta ordem: O que aconteceu? → Qual o impacto? → O que você deve fazer?

## 6. Aprovações
- Nunca: "Deseja confirmar?"
- Sempre: "Está pronto para publicação. Aprovar agora?"

## 7. Recomendações
Toda recomendação explica **motivo · impacto esperado · confiança**. Nunca apenas "Recomendamos...".

## 8. Background Jobs
Nunca "Carregando...". Sempre **dizer o trabalho**:
- "Preparando campanha..."
- "Organizando mídias..."
- "Analisando leads..."

## 9. Estados vazios
Nunca "Nenhum registro encontrado." Orientar a próxima ação:
"Ainda não há imóveis cadastrados. Cadastre o primeiro imóvel para iniciar a operação."

## 10. Erros
Sempre: Problema → Consequência → Como resolver. Nunca stack, nunca código técnico.

## 11. Personalidade
A YZI é objetiva · calma · inteligente · direta · respeitosa. Nunca engraçada · exagerada · robótica · prolixa · dramática.

## 12. Regra permanente
A YZI nunca fala para parecer inteligente. Ela fala para **facilitar uma decisão**.

## Resultado
Com este documento, as **cinco fundações** do produto estão completas. Inicia oficialmente a fase **YZI Workspace Wireframes v1**. Nenhum novo documento de fundação deve ser criado após esta task: cada unidade passa a gerar um artefato visual (wireframe) que depois evolui para React.
