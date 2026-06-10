# YZI OS — Filosofia Arquitetural

> Documento fundacional. Explicita a visão de mundo operacional que organiza todas as
> decisões arquiteturais do YZI OS. Deriva do [Manifesto](manifesto.md) e da
> [Missão](mission.md).
>
> Camada: `foundation` · Status: canônico · Versão: v1

---

## 1. A separação fundamental: linguagem ≠ operação

A filosofia do YZI OS começa numa distinção que a maioria dos sistemas de IA colapsa:
**linguagem não é operação**.

O modelo de linguagem é um motor probabilístico de compreensão e geração — um "cérebro sem
mãos". `[PYR]` Ele não loga em um CRM, não cria um ticket, não move estado, não autoriza um
pagamento. Mesmo o *function calling* produz apenas a **descrição** de uma invocação ("eu
gostaria de chamar a função X com os parâmetros Y"); a invocação real, o tratamento do
resultado e a decisão do próximo passo pertencem a um sistema externo. `[PYR]`

O YZI OS leva essa distinção ao nível arquitetural: a **camada linguística** (agentes, LLM)
é desacoplada da **camada operacional** (services, tools, state). A linguagem propõe; a
operação dispõe. Esta separação é a manifestação, no nível humano-IA, do princípio clássico
de **separação de preocupações**: compreender, planejar, executar e avaliar são fases
distintas, com critérios e modos de falha distintos; colapsá-las produz qualidade
sistematicamente inferior. `[CE]`

---

## 2. O backend decide; o estado governa

Numa arquitetura centrada no modelo, a decisão é delegada à inferência. No YZI OS, **a
decisão é uma responsabilidade do backend**. O modelo informa; os services decidem; o estado
registra.

A consequência é que **estado operacional importa mais que memória conversacional**. Memória
conversacional é frágil, opaca à auditoria e não-portável: o usuário recebe um instrumento de
escrita, mas não de controle. `[PYR]` Estado operacional persistido é a verdade do sistema —
recuperável, isolável e auditável.

Disto deriva uma postura: **memória é um ambiente que se administra, não um campo que se
preenche**. `[PYR]` A continuidade não é "lembrar" — é montar, a cada passo, o recorte
correto do estado disponível, preservando histórico e proveniência entre chamadas. `[PYR]`

O sistema reconhece quatro formas distintas de memória, cada uma com custo, isolamento e
ciclo de vida próprios: **working** (a janela atual), **episódica** (log externo de
interações), **semântica** (conhecimento estruturado, recuperado via RAG) e **procedural**
(capacidade codificada). `[PYR]` Tratá-las como uma coisa só é o erro que a arquitetura de
estado do YZI OS evita.

---

## 3. Contexto é o sistema operacional do agente

O contexto não é "dado de entrada"; é o **ambiente de execução** do agente — o seu sistema
operacional. `[PYR]` Como um OS, ele gerencia memória (o que reter, o que descartar), aloca
recursos (que dados são acessíveis a qual sub-agente), isola processos (a saída de um módulo
não contamina outro) e oferece interface unificada aos sistemas externos.

Por isso o contexto é uma **representação compilada de um sistema stateful mais rico**, não
uma string de texto. `[PYR]` Ele resulta de um pipeline — armazenamento → transformações
(compressão, filtragem, enriquecimento) → contexto de trabalho montado — e a qualidade desse
pipeline determina a qualidade da decisão.

A engenharia de contexto é, então, **logística de conhecimento just-in-time**: o que incluir,
quando fornecer, em que forma, por quanto tempo e para qual sub-agente. `[PYR]` Bom contexto
não é "tudo o que está disponível"; é "o mínimo suficiente para a decisão".

---

## 4. Governança vive fora da linguagem

Se a governança vivesse no prompt, seria probabilística — sujeita à eloquência, à injeção e
à deriva. A filosofia do YZI OS é que **governança deve ser estrutural e determinística**.

A engenharia de harness distingue dois regimes de controle: `[HE-GOV]`

- **Guidance** (pré-geração): instruções, exemplos, decomposição. Aumenta a probabilidade de
  conformidade, mas **não a garante**.
- **Enforcement** (pós-geração): regras, validações, gates verificáveis. Produz veredito
  binário pass/fail, **independentemente de qual agente produziu a saída**.

Daí decorre a **independência de agente**: quando o enforcement é suficientemente abrangente,
a identidade de quem produziu a operação torna-se irrelevante ao resultado — a qualidade
estrutural passa a ser propriedade do harness, não do autor. `[HE-GOV]`

E daí o paradoxo produtivo: **restringir o runtime habilita mais autonomia**. `[HE-GOV]` A
confiança para delegar cresce na exata medida em que o espaço de ação é deliberadamente
estreitado por governança.

No YZI OS, a governança comportamental é composta por **RAG + XML + Policies**: o retrieval
governa o que o agente sabe e, portanto, como se comporta; as policies definem o que ele pode
e não pode fazer; os contratos de specification definem o que uma classe de operação deve
produzir. Specifications são a **constituição** dos agentes: as intenções são as leis
promulgadas sob ela, o contexto é sua aplicação, e o prompt é uma ação específica numa
situação específica. `[PYR]`

---

## 5. Verificação é uma capacidade de runtime

Na maioria dos fluxos, a verificação é delegada ao humano ou a um avaliador externo: o agente
declara conclusão e outro confere. A filosofia do YZI OS coloca a **verificação dentro da
infraestrutura**. `[HARNESS-RT]`

A conclusão de uma operação deixa de ser uma **asserção** ("está pronto") e passa a ser um
**objeto evidenciário**: requisitos mapeados a verificações determinísticas, comportamento
preservado checado, evidência e limitações reportadas. `[HARNESS-RT]` A disciplina canônica é
**reproduzir → atribuir → corrigir → verificar → reportar**, com atribuição de falha *antes*
de qualquer nova ação corretiva — separando diagnóstico de ação para evitar "remendos
aleatórios". `[HARNESS-RT]`

Complementarmente, o princípio do auditor independente: **quem executa não pode ser quem
audita**. A avaliação independente captura categorias de erro que a auto-revisão
sistematicamente ignora. `[CE]`

---

## 6. Proveniência e auditabilidade não são opcionais

Toda decisão operacional precisa ser rastreável à sua origem: de qual sistema veio cada
fragmento de contexto, quando, e com que nível de confiança. Sem proveniência, não há
auditoria de decisão, não há depuração de erro, não há conformidade regulatória. `[PYR]`

A filosofia do YZI OS trata cada operação como geradora de evidência. Inspirando-se na
observabilidade de runtime: cada edição/decisão pode ser pareada a uma **predição
falsificável** e verificada contra o resultado seguinte, tornando-se um **contrato**
versionado, com reversão em granularidade fina. `[AHE]` A trilha de auditoria não é um
esforço documental à parte — **forma-se organicamente** quando cada estágio preserva sua
própria saída. `[CE]`

Há também um invariante de governança herdado da observabilidade: o componente que opera
**não pode desligar sua própria fiscalização**. O verificador, o tracer e a configuração são
read-only para o executor; isso bloqueia os atalhos que um auto-modificador não-restrito
tomaria e mantém todo ganho atribuível. `[AHE]`

---

## 7. Isolamento contextual e multi-tenancy por desenho

Em sistemas multi-agente e multi-tenant, **cada agente vê apenas o seu próprio contexto**.
Vazamento de dados entre papéis é, simultaneamente, um problema de controlabilidade e de
segurança da informação. `[PYR]`

O isolamento é um **invariante de engenharia**, não uma recomendação: na delegação, um agente
não transfere o conjunto completo de seus direitos a um sub-agente, mas apenas a fatia
estritamente necessária — **atenuação de privilégio**, em que cada elo da cadeia estreita as
permissões. `[PYR]` E delegar difere de decompor: decomposição parte a tarefa; **delegação
transfere autoridade, responsabilidade e confiança**. Sem essa distinção, uma arquitetura
multi-agente degenera num monólito distribuído com ilusão de independência. `[PYR]`

---

## 8. O runtime executa, mas não governa

O runtime do YZI OS é **leve por princípio**. Ele coordena: monta contexto, roteia,
orquestra, executa o ciclo de operação. Mas ele **não detém autoridade comportamental** — o
comportamento é governado pelas camadas de estado, retrieval e policies.

Esta é a contraparte de execução da separação linguagem/operação: assim como a linguagem
propõe sem dispor, o runtime executa sem governar. A autoridade comportamental é externa ao
runtime, exatamente como é externa ao modelo.

---

## 9. Síntese

A filosofia do YZI OS pode ser comprimida em um conjunto de inversões em relação ao paradigma
centrado no modelo:

| Paradigma centrado no modelo | Filosofia do YZI OS |
| --- | --- |
| O modelo decide | O backend decide; o estado governa |
| Memória conversacional | Estado operacional persistido |
| Governança no prompt (probabilística) | Governança estrutural (determinística) `[HE-GOV]` |
| Capacidade é do modelo | Capacidade é do sistema modelo–harness–ambiente `[HARNESS-RT]` |
| Conclusão por asserção | Conclusão por evidência verificada `[HARNESS-RT]` |
| Contexto é entrada | Contexto é o OS do agente `[PYR]` |
| Linguagem = operação | Linguagem desacoplada da operação |
| Confie no modelo | Confie na arquitetura `[CE]` |

Cada princípio em [`principles.md`](principles.md) é uma consequência operacional direta de
uma destas inversões.
