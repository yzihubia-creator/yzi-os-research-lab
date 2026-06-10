# YZI OS — Missão Institucional

> Documento fundacional. Define o problema que o YZI OS resolve e a razão de sua
> existência como infraestrutura. Deriva do [Manifesto](manifesto.md).
>
> Camada: `foundation` · Status: canônico · Versão: v1

---

## 1. O problema institucional

Organizações estão implantando agentes de IA mais rápido do que conseguem governá-los. A
implantação supera a maturidade de governança, e essa defasagem não é estatística — é
**arquitetural**. `[PYR]`

O problema se decompõe em quatro déficits, cada um documentado na base teórica e cada um
endereçado por uma camada do YZI OS.

### 1.1 Déficit de contexto

Um agente que opera por dezenas de passos perde-se em contexto contaminado: resultados
intermediários, logs obsoletos e estados antigos lotam a janela e degradam a decisão
(`context rot`: envenenamento, distração, confusão, conflito). `[PYR]` Quando o contexto
"se forma espontaneamente" a partir de bases de conhecimento mal conectadas, políticas não
coordenadas e logs não filtrados, o déficit não é a inteligência do modelo, mas **a
qualidade do mundo montado para ele**. `[PYR]`

### 1.2 Déficit de estado e continuidade

O modo conversacional é stateless: cada chamada começa em branco. Operação institucional é
**stateful** — depende de memória de projeto, estado de tarefa, histórico e continuidade
entre sessões. `[PYR]` A continuidade não pode depender da "memória" do modelo; deve viver
em estado persistido, recuperável e auditável — o padrão da Referência Mestra, em que um
documento de autoridade acumula decisões e é reintroduzido a cada interação, garantindo
continuidade **sem** depender da memória do modelo. `[CE]`

### 1.3 Déficit de intenção e de governança comportamental

Um agente que vê tudo o que precisa ainda pode otimizar o objetivo errado. O caso Klarna é
o exemplo canônico de um **déficit duplo**: contexto presente, intenção ausente — respostas
tecnicamente corretas que destruíram a relação com o cliente. `[PYR]` Governança por
instrução em linguagem natural é probabilística e não escala: "guidance demais vira
não-guidance". `[HE-GOV]` A governança comportamental precisa ser separada da linguagem e
aplicada de forma determinística.

### 1.4 Déficit de especificação (specification debt)

Conhecimento institucional vive em PDFs, ordens executivas, acordos verbais e no "todo
mundo já sabe". Sistemas autônomos são **estruturalmente incompatíveis** com mecanismos
informais. Quanto mais fácil criar agentes, mais crítico se torna formalizar o que
"criado bem" significa — sob pena de **dívida de especificação** que vence quando a escala
cresce. `[PYR]`

---

## 2. A tese central

A indústria entrou numa nova etapa: **quem captura a camada de síntese e decisão sobre os
dados institucionais absorve o valor que antes pertencia às aplicações isoladas**. Sistemas
operacionais stateful tornam fontes como CRMs, ERPs e ferramentas de gestão em **fontes de
sinal** para uma camada de síntese, decisão e ação que assume a continuidade operacional. `[PYR]`

O YZI OS existe para ser essa camada — mas construída sobre **governança**, não sobre
conveniência. A missão não é "colocar IA em cima de dados"; é construir a infraestrutura
operacional cognitiva que torna a capacidade latente do modelo em **comportamento
institucional auditável, verificável e mantível**. `[HARNESS-RT]`

---

## 3. A missão

> **Tornar capacidade cognitiva probabilística em operação institucional governada.**

Operacionalmente, isto significa construir uma infraestrutura que:

1. **Persista a verdade operacional** em estado, e faça o estado — não a conversa —
   governar a continuidade.
2. **Monte contexto sob demanda** (composição, momento, formato e tempo de vida da
   informação), com qualidade mensurável: relevância, suficiência, isolamento, economia e
   proveniência. `[PYR]`
3. **Separe governança de linguagem**, aplicando políticas comportamentais de forma
   determinística (Enforcement), não apenas sugerida (Guidance). `[HE-GOV]`
4. **Execute operações de forma controlada**, através de services e tools com fronteiras
   de permissão explícitas e atenuação de privilégio na delegação. `[PYR]`
5. **Verifique a conclusão como capacidade de runtime** — vinculando requisitos a
   evidência determinística, não a uma asserção em linguagem natural. `[HARNESS-RT]`
6. **Produza evidência auditável** de toda ação operacional: proveniência, atribuição de
   falha e trilha de decisão como artefatos de primeira classe. `[HARNESS-RT]` `[AHE]`
7. **Isole tenants por desenho**, de modo que o contexto, o estado, a memória e as
   políticas de uma instituição sejam inacessíveis a outra.

---

## 4. A quem o YZI OS serve

O YZI OS serve a **instituições que delegam autoridade operacional a agentes** e que, por
isso, precisam de governança, continuidade e auditabilidade reais.

A figura central deixa de ser o *usuário* e passa a ser o **operador**: quem define o
objetivo do agente, o configura e responde pelo resultado. `[PYR]` A responsabilidade pelas
ações do agente recai sobre a instituição que o opera — não sobre uma "IA" abstrata. `[PYR]`
A infraestrutura existe para que essa responsabilidade seja **exercível**: para que o
operador possa governar o que pede, governar o que o agente faz, e provar depois o que foi
feito.

---

## 5. Critério de sucesso

O YZI OS cumpre sua missão quando:

- a **continuidade operacional** sobrevive ao fim de qualquer sessão e à substituição de
  qualquer modelo;
- nenhuma **ação operacional** ocorre sem proveniência e sem possibilidade de auditoria;
- o **comportamento** dos agentes é governado por políticas e specifications, não pela
  eloquência do prompt;
- a **escala** (muitos agentes, muitos tenants) não degrada a coerência, porque a coerência
  é uma propriedade das specifications e não da coordenação manual. `[PYR]`

Em uma frase: **quem controla o contexto controla o comportamento; quem controla a intenção
controla a estratégia; quem controla as specifications controla a escala**. `[PYR]` O YZI OS
é a infraestrutura que coloca esses três controles nas mãos da instituição.
