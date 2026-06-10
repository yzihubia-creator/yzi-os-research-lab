# YZI Homepage Copy Red Team v1

## Red Team Thesis

> **The copy must be attacked before it is refined.**

Este documento ataca a copy de `yzi-homepage-copy-draft-v1.md`. O objetivo não é defendê-la, é encontrar onde ela quebra: onde soa genérica, onde promete sem provar, onde confunde, onde perde a venda da primeira sessão. Toda fraqueza apontada aqui é insumo para a revisão — nenhuma é correção aplicada.

## Core Risk

**Veredito: a copy é majoritariamente original do YZI OS, mas tem bolsões de SaaS genérico com IA que podem contaminá-la.**

O que a salva do genérico: nomear o inimigo (vazamento) antes do produto, a tríade "CRM registra / analytics observa / automação dispara / YZI opera", e a prova como demonstração em vez de depoimento. Nenhuma homepage de CRM-com-IA abre assim.

O que a puxa de volta para o genérico:

- **"fica mais inteligente sobre o seu negócio a cada resultado"** — frase que aparece em dezenas de SaaS de IA; é o trecho mais clichê do draft;
- **termos de framework em inglês** (`Detect → Prioritize → Operate → Recover → Learn`, `Growth Leakage`) numa página em português — cheiro de pitch deck, não de conversa com dono de negócio;
- **mecanismo opaco do CTA** — "Descubra onde está vazando" não diz o que acontece ao clicar; opacidade de mecanismo é exatamente o padrão de lead-gen SaaS genérico (e-mail → sequência → vendas).

O risco central não é de posicionamento — é de execução verbal. A direção segura o original; algumas frases e a mecânica do CTA vazam genérico.

## Strategic Copy Risks

| Risk | Why It Matters | Severity |
| ---- | -------------- | -------- |
| Soa abstrato demais | "Crescimento vazando" é metáfora; sem exemplo concreto nos primeiros segundos, o dono de negócio não se vê na frase. O draft mitiga com exemplos na seção Growth Leakage — mas eles vêm *depois* do hero. | Média |
| Soa SaaS demais | Termos em inglês (Detect/Prioritize/Operate), "aprende com cada resultado" e estrutura seção-a-seção previsível empurram para o template SaaS que o guardrail proíbe. | Média |
| Parece promessa de crescimento | "Traz de volta o que você já tinha perdido" beira a garantia de resultado. Falta o disclaimer implícito de estimativa em alguns pontos fora do Radar. | Média |
| Parece CRM com IA | A palavra "lead", "follow-up" e "proposta parada" são vocabulário de CRM. Usadas para nomear a dor, ok — mas se a revisão adicionar mais uma camada disso, vira página de CRM. | Baixa–Média |
| Parece chatbot | "Retomada na voz do seu negócio, pronta para reabrir a conversa" pode ser lido como "robô que manda mensagem". É o ponto onde o leitor cético pensa "ah, é um bot de WhatsApp". | **Alta** |
| Não prova o suficiente | A prova é uma narrativa hipotética ("um contato pediu informação há 5 dias") sem âncora de realidade. Demonstração narrada ≠ demonstração vista. Aceitável em draft; fatal em produção sem upgrade. | **Alta** |
| Fala demais antes de mostrar | São 5 seções de texto (Hero → Leakage → Tools → Operator → Radar) antes da primeira prova. O arco emocional pode esfriar antes do alívio chegar. | Média |
| CTA parece venda | "Deixe a YZI olhar seu negócio" é bom, mas o fechamento nega demo/vendas duas vezes ("Não é uma demo. Não é uma conversa com vendas.") — negação dupla ativa o radar de venda em vez de desarmá-lo. | Média |
| YZI não parece operadora | Em PT-BR, "operadora" carrega conotação de telecom/plano de saúde ("operadora de celular", "operadora de saúde"). O termo central do posicionamento pode evocar a categoria errada no Brasil. | **Alta** |
| Visitante pode não entender Growth Leakage | O termo é apresentado em inglês, em negrito, como conceito — mas dono de PME brasileiro não pensa em "growth leakage"; pensa em "cliente que sumiu". O conceito é entendível; o rótulo, não. | Média–Alta |

## Hero Stress Test

**Headline:** `Seu crescimento está vazando.`

**Subheadline:** `Entre o clique, a conversa e o follow-up, oportunidades escapam todo mês — em pontos que você talvez nem esteja olhando.`

**CTAs:** `Descubra onde está vazando` / `Veja uma oportunidade voltar à vida`

### O que funciona

- Headline de 4 palavras que nomeia o inimigo sem nomear a plataforma — cumpre o princípio do hero (`hero-copy-options-v1`) na forma mais pura;
- "Entre o clique, a conversa e o follow-up" desenha o trajeto do vazamento em 7 palavras — concretude rara em hero;
- CTA primário continua o arco da headline (vazamento → descobrir onde) em vez de quebrar para linguagem de produto;
- CTA secundário promete o momento de maior impacto (a ressurreição) — alinhado à Recovery Proof.

### O que falha

- **"talvez nem esteja olhando"** — o "talvez" é uma concessão que enfraquece. A versão das hero options ("em pontos que você não está olhando") afirma; o draft hesita;
- **"oportunidades escapam" vs. "o dinheiro escapa"** — a opção original Growth Leakage #1 dizia *dinheiro*; o draft suavizou para *oportunidades*. Dinheiro é visceral; oportunidade é abstração. O hero perdeu o golpe mais forte da fonte;
- **mecanismo invisível** — nenhum dos dois CTAs diz o que acontece ao clicar. "Descubra onde está vazando" pode ser um formulário, um e-book, uma call de vendas. A dúvida custa cliques;
- a headline sozinha não distingue de uma agência de marketing ou consultoria — qualquer uma poderia abrir com "seu crescimento está vazando".

### O que pode ficar mais forte

- Restaurar **dinheiro** na subheadline (fonte: hero option #1) e cortar o "talvez";
- Sinalizar o mecanismo no microcopy do CTA (ex.: indicar que é a primeira sessão com a YZI, sem virar "agendar demo");
- Considerar um elemento de assinatura YZI já no hero (a operadora que "já está olhando") para diferenciar de consultoria genérica — a hero option #3 oferece isso pronto.

## Section-by-Section Critique

| Section | Works | Fails / Risk | Recommended Fix |
| ------- | ----- | ------------ | --------------- |
| Hero | Inimigo nomeado em 4 palavras; trajeto do vazamento concreto. | "Talvez" hesita; "oportunidades" diluiu "dinheiro"; CTA sem mecanismo. | Restaurar "dinheiro", cortar "talvez", indicar primeira sessão no microcopy. |
| Growth Leakage | Exemplos concretos (lead sem resposta, proposta parada); "sem aparecer em nenhum relatório" é forte. | Rótulo "Growth Leakage" em inglês não gruda em dono de PME; parágrafo final repete a tese duas vezes. | Manter o conceito, traduzir/apelidar o rótulo (ex.: "vazamento de crescimento") e cortar a redundância. |
| Why Existing Tools Miss It | A tríade registra/observa/dispara → opera é o bloco mais diferenciador da página. | "A YZI opera" sem objeto pode soar vago; leitor com automação pode achar que já tem isso. | Completar o contraste: dispara *mas não percebe quando a oportunidade morre* — já existe no texto; elevar essa linha. |
| YZI as Operator | "Não é CRM para preencher / chatbot para configurar / agente para supervisionar" desarma as três categorias erradas. | **"Operadora" evoca telecom/saúde em PT-BR**; "É alguém operando" promete humano e pode gerar quebra de expectativa. | Testar sinônimos de posicionamento na revisão (quem opera / time de operação / a YZI opera por você) sem perder o conceito de operator. |
| Opportunity Radar Preview | Valor + relógio + ação recomendada em 4 bullets; "não é um dashboard para contemplar" mata a leitura passiva. | Tudo descrito, nada mostrado — é a seção que mais precisa de artefato visual e menos pode ter um neste draft. | Na revisão, escrever a copy *ao redor* de um exemplo concreto do Radar (1 oportunidade com R$ e relógio), não sobre o Radar em abstrato. |
| Recovery Proof | Segue a sequência da spec; termina em "aguardando sua aprovação" (humano no controle = confiança). | Tensão lógica: 5 dias parado, mas "nas próximas horas esfria de vez"; meta-frase "Isso não é um depoimento" explica em vez de mostrar. | Alinhar a janela temporal (dias → janela de recuperação) e cortar a meta-frase; a demonstração deve falar por si. |
| How It Works | A frase-síntese em português é clara e cumpre "operação, não arquitetura". | Os 5 passos em inglês (`Detect → ... → Learn`) quebram a língua da página; "fica mais inteligente a cada resultado" é clichê de IA. | Manter o inglês só como nome interno do ciclo; na página, liderar com os verbos em português; reescrever a linha do Learn. |
| Plans Preview | Estágios como maturidade ("em que estágio a minha operação está?") — exatamente a tese da spec. | Sem pricing nem CTA por plano, a seção pode parecer incompleta/evasiva ("quanto custa?" sem resposta nem direção). | Manter sem pricing (regra), mas adicionar os CTAs por plano já definidos em `plans-preview-section-v1` para dar destino a cada estágio. |
| Final CTA | "O que a YZI encontraria no seu negócio?" personaliza a convicção; tom de diagnóstico correto. | Dupla negação ("Não é uma demo. Não é uma conversa com vendas.") soa defensiva; **"primeira sessão" nunca é nomeada** — o destino concreto do clique segue indefinido. | Substituir as negações por afirmação do que *é* (a primeira sessão com a YZI, o que ela mostra, em quanto tempo). |

## Clarity Test

Um dono de empresa, em menos de 10 segundos (hero + primeiras linhas):

| Pergunta | Veredito | Observação |
| -------- | -------- | ---------- |
| Qual problema existe? | ✅ Passa | "Crescimento vazando" + clique/conversa/follow-up — o problema é nomeado e localizado. |
| Por que isso custa dinheiro? | ⚠️ Parcial | O custo é inferível, não declarado — a palavra *dinheiro* foi suavizada para *oportunidades* no hero. |
| Quem é a YZI? | ❌ Falha em 10s | A YZI não aparece no hero; só é definida na 4ª seção. Dentro do princípio (inimigo antes da plataforma), mas em 10 segundos o visitante não sabe quem fala com ele. |
| O que acontece se clicar? | ❌ Falha | Nenhum CTA explica o mecanismo. "Descubra onde está vazando" → formulário? análise? call? A "primeira sessão" não é nomeada em lugar nenhum da página. |
| Por que não é CRM/chatbot? | ⚠️ Parcial | A diferenciação existe e é boa — mas só na 3ª/4ª seção. Em 10 segundos, um cético pode arquivar como "mais um SaaS de IA". |

**Síntese:** o problema passa; o mecanismo e a identidade falham no corte de 10 segundos. As duas falhas convergem no mesmo fix: nomear a primeira sessão com a YZI mais cedo.

## Trust Test

| Critério | Veredito | Evidência |
| -------- | -------- | --------- |
| Evita números inflados | ✅ | Nenhum número inventado; valor sempre como "estimativa honesta". |
| Evita promessa de crescimento garantido | ⚠️ | Sem garantia explícita, mas "Ela traz de volta o que você já tinha perdido" afirma resultado no indicativo — beira a promessa. Reformular para capacidade, não garantia. |
| Evita hype de IA | ✅ (com ressalva) | A copy nunca diz "IA/AI" — decisão forte. Ressalva: "fica mais inteligente a cada resultado" é o único trecho com perfume de hype. |
| Evita claims sem prova | ⚠️ | A prova existente é narrativa hipotética; sustenta um draft, não sustenta produção. Todos os claims de operação dependem dela. |
| Evita linguagem genérica | ⚠️ | 80% original; os 20% genéricos estão mapeados no Core Risk (frase do Learn, termos em inglês, negação de demo). |

## Differentiation Test

A tríade é o ativo mais forte da copy:

- **CRM registra** — ✅ claro e justo (não ataca a ferramenta, redefine o papel dela);
- **analytics observa** — ✅ claro;
- **automação dispara** — ✅ claro, e a extensão "mas não percebe quando a oportunidade está morrendo" é o argumento decisivo contra "eu já tenho automação";
- **YZI opera** — ⚠️ o verbo carrega todo o posicionamento, mas chega sem definição operacional no primeiro uso. "Opera" só ganha significado completo 3 seções depois (Radar + Proof). Risco: na primeira leitura, "opera" = palavra de marketing.

**Veredito:** a diferenciação conceitual é excelente; a entrega verbal do quarto termo ("opera") precisa de um complemento imediato no primeiro uso — uma linha que mostre o que operar significa (ex.: a linha existente "pega a oportunidade em risco e trabalha nela até o desfecho" deve ser inseparável do primeiro "YZI opera").

## Conversion Risk

**Veredito: o CTA está conceitualmente certo e mecanicamente fraco.**

- ✅ Não parece demo/venda: nenhum "agende uma demo", nenhum "fale com vendas", nenhum pricing wall — os guardrails da `final-cta-section-v1` foram respeitados;
- ❌ **"Primeira sessão" não existe na página.** As specs inteiras convergem para "a primeira sessão com a YZI" como destino do funil — e a copy nunca pronuncia o termo. O visitante convicto não sabe o que está aceitando;
- ❌ A dupla negação no fechamento ("Não é uma demo. Não é uma conversa com vendas.") é defensiva — quem precisa negar venda lembra o leitor de venda. Afirmar o que a sessão *é* converte melhor do que negar o que não é;
- ⚠️ Custo invisível: o visitante não sabe o que a sessão exige dele (tempo? acesso? dados?). Incerteza de custo é atrito de conversão clássico.

Risco líquido: o visitante chega convencido do problema e hesita no clique por não saber o que há do outro lado. É o gap nº 1 a fechar na revisão.

## Kill / Keep / Change

### Keep

- Headline `Seu crescimento está vazando.` — o melhor ativo da página;
- A tríade `CRM registra / analytics observa / automação dispara / YZI opera`;
- A sequência de prova `Detected Leakage → Opportunity in Risk → Recovery Preview` com "aguardando sua aprovação" (humano no controle);
- Planos como estágios de maturidade com a pergunta "em que estágio a minha operação está?";
- A decisão de nunca dizer "IA/AI" na copy;
- A frase-síntese do ciclo em português ("A YZI encontra oportunidades em risco, prioriza...");
- CTA principal `Deixe a YZI olhar seu negócio`.

### Change

- Subheadline do hero: restaurar **dinheiro** e cortar **"talvez"**;
- Rótulo "Growth Leakage" em inglês → apelido em português na página (conceito mantido);
- "Operadora": testar alternativas de entrega verbal em PT-BR que evitem a conotação telecom/saúde sem perder o conceito de operator;
- Passos do ciclo em inglês → verbos em português na página (inglês fica como nome interno);
- Fechamento do Final CTA: substituir a dupla negação por afirmação do que é a primeira sessão (nome, conteúdo, custo de entrada);
- "Ela traz de volta o que você já tinha perdido" → capacidade, não promessa ("trabalha para trazer de volta");
- Nomear "primeira sessão com a YZI" pelo menos no CTA pós-prova e no Final CTA;
- Adicionar os CTAs por plano (já definidos em `plans-preview-section-v1`) à seção de planos.

### Kill

- "E fica mais inteligente sobre o seu negócio a cada resultado." — clichê de SaaS de IA; reescrever do zero, não polir;
- "Isso não é um depoimento." — meta-comentário; a demonstração deve falar por si;
- "Não é uma demo. Não é uma conversa com vendas." — negação dupla defensiva no fechamento;
- O "talvez" da subheadline do hero.

## Final Recommendation

**`APPROVE_FOR_REFINEMENT`**

**Motivo:** nenhuma falha encontrada é de posicionamento — todas são de execução verbal e mecânica de conversão. A direção central (vazamento antes de plataforma, prova antes de produto, YZI como quem opera, planos como estágios) sobreviveu ao ataque intacta; é ela que distingue a página de SaaS genérico, e ela está funcionando. Os três riscos altos (conotação de "operadora" em PT-BR, leitura de chatbot na retomada, prova narrativa sem âncora) e o gap de conversão ("primeira sessão" nunca nomeada) são todos endereçáveis numa revisão de copy — não exigem rework de posicionamento. Recomendar `REVISE_BEFORE_REFINEMENT` exigiria dúvida sobre a tese; não há. Recomendar `REJECT_COPY_DIRECTION` exigiria a direção quebrada; ela é o que a página tem de melhor.

Condição: a revisão (v1.1) deve tratar obrigatoriamente os 4 itens da lista Kill e os 3 riscos de severidade Alta antes de qualquer refinamento estético.

## Non-Goals

Este documento **não** cria:

- copy final;
- UI final;
- layout;
- wireframe;
- implementação;
- código;
- workflow;
- integração;
- pricing final;
- vertical específica.

## Non-Execution Declaration

`This document is a copy red team only. It does not authorize implementation, UI creation, layout, workflow, integration, pricing, or production use.`

## Next Step

`Task 284 — Revise YZI Homepage Copy Draft v1.1`

(Justificativa: a direção de posicionamento foi aprovada no ataque; `Task 284A — Rework YZI Homepage Positioning Before Copy Revision` só seria necessária se o Core Risk tivesse falhado — e não falhou.)

## Final Status

`TASK_283_COMPLETE_COPY_RED_TEAM_ONLY`
