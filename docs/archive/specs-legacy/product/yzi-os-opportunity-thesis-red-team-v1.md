# YZI OS Opportunity Thesis — Red Team v1

> **Função deste documento:** atacar a tese de que `Opportunity` deve ser a entidade central do YZI OS. Não validar. Tentar destruir. Tudo abaixo é argumento adversarial deliberado.

## 1. Core Challenge

**Por que `Opportunity` NÃO deveria ser a entidade central do YZI OS?**

O ataque mais forte não é que `Opportunity` seja vaga — é que ela **contradiz a própria tese de posicionamento no nível do modelo mental**.

Todo o posicionamento do YZI OS é *system of action vs. system of record*: "CRM registra, YZI age". Mas escolher uma **entidade-substantivo** como núcleo é o gesto fundador de um *system of record*. CRM é object-centric (o Contact, o Deal). Ao centralizar em `Opportunity`, o YZI OS permanece **object-centric** — define-se pela *coisa operada*, não pela *operação*. Um sistema cuja tese é o verbo ("agir") mas cujo núcleo é um substantivo herda a forma do CRM mesmo jurando ser o oposto.

Pior: o substantivo escolhido **é literalmente o objeto do CRM**. A `Opportunity` é o nome do registro central do Salesforce. Escolher essa palavra é importar, de graça, o modelo mental que se quer destruir.

E há um tell interno na própria tese: a seção *Internal vs External Language* admite que a palavra "Opportunity" **não pode ser usada com o cliente** — precisa de uma camada de tradução (Growth Leakage, Recovery, etc.). Se a entidade central não pode ser falada ao comprador, ela talvez não seja uma escolha de **produto/posicionamento** — é uma escolha de **modelagem interna disfarçada de estratégia**. Uma entidade central de verdade deveria ser dizível.

**Resumo do ataque:** `Opportunity` é (a) object-centric num produto que se vende como action-centric, (b) propriedade vocabular do CRM, e (c) indizível ao cliente. Três contradições estruturais, não cosméticas.

## 2. Category Risks

| Risk | Why It Matters | Severity |
| ---- | -------------- | -------- |
| **Opportunity já pertence ao CRM** | É o nome do objeto central do Salesforce/HubSpot. Usá-la importa o modelo mental que se quer combater; toda diferenciação vira luta contra a definição existente. | **Alta** |
| **Salesforce gravity** | Décadas de mercado treinaram compradores a ouvir "opportunity" = pipeline/estágio/forecast. A gravidade puxa a percepção (e a UX) de volta ao pipeline, independentemente da intenção. | **Alta** |
| **Confusão de categoria** | Se o mercado ouve "opportunity", ele categoriza como CRM e compara por preço/feature com CRM — terreno onde o YZI perde (não é system of record). | **Alta** |
| **Opportunity é abstrata demais** | Um substantivo conceitual, não um objeto que o dono vê e toca. Abstração no núcleo dilui o "isto entendeu meu negócio". | **Média** |
| **Cliente não compra Opportunity** | Compra receita recuperada e menos entropia. Centralizar numa entidade que ninguém *compra* arrisca construir o produto ao redor de um conceito ausente da boca do comprador. | **Média-Alta** |
| **Opportunity pode virar pipeline** | A afordância natural de "uma opportunity" é uma lista com estágios. Lista + estágios = pipeline = CRM. O caminho de menor resistência leva ao pântano. | **Alta** |
| **Produto pode degenerar para CRM** | Se a `Opportunity` virar um registro estático que o humano gerencia, o YZI OS é um CRM mais bonito — com a desvantagem de competir contra incumbentes consolidados. | **Crítica** |
| **Opportunity pode ser só um nome novo para Deal** | Se na prática a maioria das opportunities operadas forem pré-venda em movimento, "Opportunity" colapsa em "Deal" e a amplitude prometida (pré/pós-deal, dormência, atendimento) vira marketing vazio. | **Alta** |

## 3. Positioning Stress Test

- **Growth Leakage** — Forte como *inimigo*, fraco como *categoria*. É um nome de problema, não de solução; e é **negativo/loss-framed** (vende medo). Pior: "leakage de quê?" exige educação — um dono de PME não pensa "estou vazando crescimento", pensa "perdi uns clientes". **Quebra** quando precisa carregar a categoria sozinho ou quando o comprador não sente o vazamento que não vê.
- **Opportunity Recovery** — Bom wedge (a ressurreição é o "holy shit"), mas **enquadra o produto como remediação, olhando para trás**. "Recovery" pressupõe algo já perdido — subvende o quadrante New+Heating e a Expansão, que são proativos. **Quebra** ao tentar ser a promessa total: vira "produto de reanimação", não de crescimento.
- **Opportunity** — CRM-coded, abstrata, indizível ao cliente (ver §1, §5). **Quebra** no contato com o comprador: requer explicação e importa o frame errado.
- **Revenue Recovery** — O mais claro em R$, mas colide com uma **categoria adjacente perigosa**: "revenue recovery" já significa cobrança/recuperação de crédito, *accounts receivable*, chargebacks, factoring. **Quebra** por confusão semântica com finanças/cobrança — adjacência errada e pouco aspiracional.

Conclusão do stress test: **nenhum dos quatro conceitos é, sozinho, uma categoria limpa e aspiracional.** Todos ou são negativos (leakage, recovery) ou ambíguos (opportunity, revenue recovery). Isso é um sinal de fragilidade de posicionamento, não de força.

## 4. Alternative Core Entities

| Candidata | Vantagem | Problema |
| --- | --- | --- |
| **Signal** | Honesta, pré-CRM, **zero bagagem**; é o input verdadeiro do sistema. | Upstream demais — não carrega dinheiro, volume infinito = ruído, não é unidade de valor nem acionável sozinha. Faria o produto parecer analytics/observabilidade. |
| **Decision** | Centra na escolha de agir — alinhado ao "system of action". | Vaga, difícil de quantificar, não é algo que o cliente rastreia. Pouco operável como unidade. |
| **Revenue Event** | Concreta, ancorada em dinheiro, mensurável. | "Event" é **passado/passivo** — já aconteceu. Perde o relógio e a operação preventiva. Soa a analytics. |
| **Outcome** | Ótima para percepção de valor (vende resultado). | Ampla e abstrata demais; sem ciclo de vida, sem unidade operável. Não dá para "operar um outcome". |
| **Growth Event** | Neutra de vertical, conecta ao tema growth. | Igual a Revenue Event: "event" é passivo e vago. Não carrega ação nem decaimento. |
| **Action** | **Alinhada à tese-verbo** ("YZI acts"); foge da armadilha do substantivo-CRM. | Sem um objeto para organizá-las, ações são formless. Difícil montar um placar de *valor* sobre "ações". Risco de virar task-management/automação. |

**Achado incômodo do red team:** a candidata mais coerente com a *tese* (action) é a pior para construir um *placar de valor*; e a melhor para placar (revenue event) é passiva. `Opportunity` sobrevive não por ser ótima, mas por ser **a menos ruim** — ela é a única que carrega dinheiro **e** movimento **e** neutralidade de vertical ao mesmo tempo. Isso é uma defesa fraca: "vence por eliminação", não por mérito. Uma entidade central deveria vencer por mérito.

## 5. Customer Understanding Test

**Um dono de empresa entende naturalmente a palavra "Opportunity"?**

Coloquialmente, sim — "uma oportunidade de negócio". Como **entidade de sistema rastreada**, não. No momento em que o produto a usa como objeto com estágios e quadrantes, uma de duas coisas acontece:

1. **Exige explicação** — e aí o produto paga um **imposto de educação** e perde a mágica do "isto já entende meu negócio". O dono fala "leads que esfriaram", "clientes que sumiram", "propostas paradas" — **nunca** "oportunidades no quadrante Existing+Cooling".
2. **Importa o significado do CRM** — e aí o dono pensa "ah, é tipo pipeline" e categoriza errado.

**O que acontece se exigir explicação:** todo conceito que precisa ser ensinado antes de ser vendido aumenta atrito de onboarding, alonga o ciclo de venda e enfraquece o "holy shit". Em PLG, **a entidade central não pode precisar de aula**. O fato de a própria tese isolar "Opportunity" como termo *interno* é a confissão de que ela falha no teste de compreensão do cliente.

## 6. Product Degeneration Risks

Como o YZI OS vira, sem querer:

- **CRM com IA** — se a `Opportunity` virar um registro numa lista/pipeline que o humano gerencia. O verbo do cliente vira "gerenciar". Gatilho mais provável de degeneração.
- **Automação com IA** — se "operar" virar sequências e gatilhos pré-configurados. **Atenção:** o módulo *Follow-up OS* já tende para isso. Se a operação for regra fixa, o YZI é Zapier/HubSpot Workflows com copy melhor.
- **Dashboard com IA** — se o *Executive Cockpit* e o placar de R$ recuperado virarem o centro de gravidade e a ação ficar secundária. Aí o produto **observa** em vez de **agir** — exatamente o que ele acusa o analytics de ser.
- **Agência com software** — se o estrategista humano do plano *Advanced* fizer o trabalho real e o software for fino. Vira serviço fantasiado de produto: margem baixa, não escala, e a "operação" é gente, não sistema.

Os quatro caminhos de degeneração são **fáceis** — são o estado de menor energia. Manter o YZI como system of action exige resistir ativamente aos quatro. A escolha de `Opportunity` como entidade **não protege** contra nenhum deles; em alguns casos, convida.

## 7. What Must Be True

Para `Opportunity` funcionar como entidade central, **tudo** abaixo precisa ser verdade:

1. **Detecção diferenciada** — o sistema precisa revelar oportunidades que os outros sistemas *não veem* (silêncios, dormência, datas). Se só rastrear o que o CRM já tem, é CRM relabeled.
2. **Operação por padrão (verbo)** — a YZI opera; o humano supervisiona. Se o humano gerencia, falhou.
3. **Quantificação crível** — o R$ por oportunidade precisa ser honesto. Número errado destrói confiança mais rápido que número nenhum.
4. **Estados de morte e recuperação de primeira classe** — *Leaked* e *Recovered* precisam ser visíveis e contados (o que o CRM não tem). É isso que diferencia.
5. **Placar atribuível** — R$ recuperado precisa ser *provável* e *atribuível* à YZI, não apenas medido.
6. **Fuga vocabular bem-sucedida** — a linguagem externa precisa escapar da palavra CRM mantendo a entidade interna coerente.
7. **Amplitude real** — pré-deal + pós-venda + atendimento precisam ser **de fato operados**, não só prometidos. Senão `Opportunity = Deal`.
8. **A operação como herói** — o produto e a UX precisam fazer da *operação/recuperação* o protagonista, não do objeto. Caso contrário a gravidade object-centric vence.

Oito condições simultâneas é **muita** condição. Quanto mais longa a lista de "what must be true", mais frágil a tese.

## 8. Kill Criteria

Abandonar (ou refundar) a tese se:

- Usuários perguntarem consistentemente **"então é um CRM?"** e o time não diferenciar em uma frase.
- A UX driftar naturalmente para um **board/pipeline que o usuário gerencia** apesar do design.
- For impossível **atribuir** receita recuperada à YZI → valor não-provável → preço insustentável.
- Clientes **preferirem gerenciar** oportunidades manualmente a tê-las operadas (o verbo falha).
- O **"wow" do onboarding não sobreviver** à retenção (encanta e churna).
- Testes de mensagem mostrarem que a linguagem externa **não escapa** da gravidade do CRM.
- Na operação real, a esmagadora maioria das opportunities forem **pré-venda em movimento** → `Opportunity` colapsou em `Deal`.

## 9. Final Recommendation

**`APPROVE_WITH_WARNINGS`**

**Motivo:** O red team não encontrou um defeito *fatal* — encontrou uma tese **correta porém frágil**. `Opportunity` vence as alternativas (por eliminação, não por brilho) por ser a única entidade que carrega dinheiro, movimento e neutralidade de vertical ao mesmo tempo. Mas o ataque mais sério permanece de pé e exige correção antes de evoluir para UX/onboarding:

1. **Contradição verbo/substantivo.** O produto se vende como *action* mas se modela como *object*. **Mitigação obrigatória:** emendar o `core-entity` doc com uma cláusula explícita — *"a operação/recuperação é o herói; a `Opportunity` é o objeto que ela move"*. A UX deve liderar pela ação, não pelo registro.
2. **Gravidade do CRM + indizibilidade.** Manter `Opportunity` como entidade **estritamente interna** e blindar a linguagem externa (a §8 *Internal vs External Language* do entity doc já inicia isso; precisa virar regra dura, testada em mensagem).
3. **Lista de 8 condições + 7 kill criteria** deve ser adotada como **guardrails de design vigiados**, não como apêndice. Especialmente: operação por padrão (não gerenciamento), estados Leaked/Recovered visíveis, e amplitude real (senão = Deal).

Não é `REJECT` (não há defeito fatal e nenhuma alternativa é superior). Não é `APPROVE` puro (as contradições estruturais são reais e ignorá-las leva direto à degeneração para CRM). É `REVISE`-adjacente: **prosseguir, mas com as emendas acima como pré-condição da próxima fase.**

## Validação interna (restrições)

Documento estritamente de produto/categoria/posicionamento. Não cria implementação, arquitetura técnica, banco, schema, runtime, workflow, integração ou vertical.
