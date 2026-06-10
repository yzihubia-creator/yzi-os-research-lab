# YZI OS — Princípios Fundamentais

> Documento fundacional. Registro canônico dos princípios invioláveis do YZI OS. Cada
> princípio é uma consequência operacional da [Filosofia](philosophy.md) e do
> [Manifesto](manifesto.md). Toda decisão de arquitetura, governança, runtime ou
> specification deve ser verificável contra este registro.
>
> Camada: `foundation` · Status: canônico · Versão: v1

---

## Como ler este documento

Cada princípio possui: um **enunciado** vinculante, a **fundamentação** teórica (com
proveniência aos papers canônicos) e a **implicação arquitetural**. Os princípios são
numerados apenas para **referência estável** (`P1`…`P18`); a numeração **não** estabelece
prioridade automática entre eles.

### Regra de resolução de conflito entre princípios

Quando dois ou mais princípios parecerem conflitar em um caso concreto, a decisão deve
**preservar os seguintes valores, nesta ordem de prioridade**:

1. **Verdade operacional** — o estado persistido e a lógica institucional permanecem fonte de verdade.
2. **Segurança** — nenhuma resolução pode introduzir risco operacional ou de segurança.
3. **Isolamento multi-tenant** — a fronteira entre tenants é inviolável.
4. **Auditabilidade** — a ação resultante permanece rastreável e auditável.
5. **Governança institucional** — políticas e specifications continuam aplicáveis.
6. **Continuidade de estado** — a continuidade operacional não é sacrificada.
7. **Desacoplamento entre linguagem e operação** — a separação camada linguística / camada operacional é mantida.
8. **Leveza do runtime** — o runtime permanece mínimo e sem autoridade comportamental.

Esta ordem de valores — e **não** o número do princípio — governa a resolução. A numeração
`P1…P18` serve unicamente como referência estável de citação. A hierarquia documental
(`manifesto` › `mission`/`philosophy` › `principles` › demais) permanece válida para
conflitos **entre documentos**.

Códigos de proveniência: `[CE]` Context Engineering · `[PYR]` Context→Intent→Specification ·
`[HE-GOV]` Harness Engineering (Governança) · `[AHE]` Agentic Harness Engineering ·
`[HARNESS-RT]` AI Harness Runtime. Ver [`terminology.md`](terminology.md).

---

### P1 — O LLM não é fonte de verdade

**Enunciado.** Nenhum modelo de linguagem é autoridade sobre o estado, as regras ou as
decisões do sistema. A saída do modelo é uma proposta probabilística, jamais um fato.

**Fundamentação.** A qualidade operacional é propriedade do sistema `modelo–harness–
ambiente`, não do modelo; creditar verdade ao modelo isolado é erro de atribuição. `[HARNESS-RT]`
No pacote de contexto, o elemento gerado/instruído é o de menor prioridade — o Paradoxo do
Metadado. `[CE]`

**Implicação.** A verdade reside no estado persistido e nos services. O modelo é consultado
para compreensão, raciocínio e geração — nunca para decidir.

---

### P2 — O backend decide

**Enunciado.** A autoridade decisória pertence ao backend (services e estado), não à camada
de inferência.

**Fundamentação.** O agente é orquestrador + tools + memória + **policies**; o LLM é apenas
o componente intelectual invocado como serviço. `[PYR]` A decisão de próximo passo é do
sistema externo, não do modelo. `[PYR]`

**Implicação.** Toda decisão operacional passa por lógica institucional verificável, não por
inferência livre.

---

### P3 — Estado persistido governa a continuidade

**Enunciado.** A continuidade operacional é função do estado persistido, não da conversa nem
da memória do modelo.

**Fundamentação.** Operação institucional é stateful; o modo conversacional é stateless e
recomeça em branco a cada chamada. `[PYR]` A Referência Mestra garante continuidade entre
sessões sem depender da memória do modelo. `[CE]`

**Implicação.** Encerrar uma sessão ou trocar de modelo não pode interromper a continuidade.

---

### P4 — Retrieval governa comportamento

**Enunciado.** O que o agente recupera determina como ele se comporta. Governar o retrieval é
governar o comportamento.

**Fundamentação.** Quem controla o contexto (políticas, memória, recuperação de dados,
fronteiras de visibilidade) controla o comportamento, o custo e a conformidade. `[PYR]`

**Implicação.** A recuperação contextual é uma decisão de governança, sujeita a política e
proveniência — não um detalhe de implementação.

---

### P5 — RAG + Policies governam os agentes

**Enunciado.** O comportamento dos agentes é governado pela combinação de recuperação
contextual (RAG/XML) e políticas, não pela formulação do prompt.

**Fundamentação.** Specifications são a constituição; intenções são as leis; o contexto é a
aplicação; o prompt é uma ação pontual. `[PYR]` Governança por instrução é probabilística;
governança por enforcement é determinística. `[HE-GOV]`

**Implicação.** Políticas e contratos comportamentais são artefatos versionados e aplicáveis,
distintos do texto de qualquer prompt.

---

### P6 — O runtime executa, mas não governa o comportamento

**Enunciado.** O runtime coordena e executa; a autoridade comportamental é externa a ele.

**Fundamentação.** O harness é a camada externa ao modelo que media observação, ação,
feedback e conclusão — distinta do modelo e da governança. `[HARNESS-RT]` "O runtime tem de
ser restringido" para que haja autonomia confiável. `[HE-GOV]`

**Implicação.** Manter o runtime **leve**: ele monta contexto, roteia e orquestra, mas não
decide o que é permitido — isso pertence às policies e ao estado.

---

### P7 — Agentes são interfaces institucionais

**Enunciado.** Um agente é a interface linguística da instituição, não um decisor autônomo.

**Fundamentação.** O agente é o representante digital que age em nome da instituição, sob suas
regras e responsabilidade. `[PYR]` A camada linguística é desacoplada da operacional. `[CE]`

**Implicação.** Agentes traduzem intenção em operação proposta; a operação é executada e
governada pelas camadas inferiores.

---

### P8 — Observabilidade é obrigatória

**Enunciado.** Toda operação produz observabilidade. Sucesso não verificável e falha não
diagnosticável são inaceitáveis.

**Fundamentação.** A observabilidade é uma das responsabilidades de runtime de primeira
classe; sem ela, há "sucesso não verificável e falha não diagnosticável". `[HARNESS-RT]`
A evolução governada exige observabilidade de componente, de experiência e de decisão. `[AHE]`

**Implicação.** Logs, traces e relatórios de verificação são artefatos do sistema, não
subprodutos opcionais.

---

### P9 — Toda ação operacional deve ser auditável

**Enunciado.** Nenhuma ação operacional ocorre sem trilha de auditoria reconstruível.

**Fundamentação.** Sem proveniência não há auditoria, depuração ou conformidade. `[PYR]` A
trilha de auditoria forma-se organicamente quando cada estágio preserva sua saída. `[CE]`

**Implicação.** Cada operação é um episódio auditável, com pacote de evidência associado. `[HARNESS-RT]`

---

### P10 — Multi-tenant por desenho

**Enunciado.** O isolamento entre instituições é uma premissa arquitetural, não uma
configuração adicional.

**Fundamentação.** Cada agente/papel vê apenas seu próprio contexto; vazamento é problema de
controlabilidade e de segurança. `[PYR]` O isolamento de memória de projeto é arquitetural —
a memória de um tenant é inacessível a partir de outro. `[PYR]`

**Implicação.** Estado, contexto, memória e políticas são particionados por tenant em todas as
camadas.

---

### P11 — Contexto deve ser modular e recuperável

**Enunciado.** O contexto é montado a partir de unidades modulares recuperáveis sob demanda,
não fornecido como um bloco monolítico.

**Fundamentação.** Contexto é logística just-in-time: o que incluir, quando, em que forma, por
quanto tempo, para qual sub-agente. `[PYR]` Operações sobre contexto: write, select, compress,
isolate. `[PYR]` A divulgação progressiva economiza tokens e melhora decisões. `[AHE]`

**Implicação.** O sistema modela composição, isolamento e ciclo de vida de contexto como
mecanismos explícitos.

---

### P12 — Governança deve ser separada da linguagem

**Enunciado.** As regras que governam o comportamento não vivem no prompt; vivem em camadas
estruturais distintas da linguagem.

**Fundamentação.** Guidance (linguagem) é probabilística; Enforcement (estrutura) é
determinística; "guidance demais vira não-guidance". `[HE-GOV]`

**Implicação.** A governança comportamental é codificada em policies, contratos e retrieval —
verificável independentemente do que qualquer agente "diz".

---

### P13 — O runtime deve permanecer leve

**Enunciado.** O runtime mantém o mínimo de responsabilidade necessária para coordenar; não
acumula lógica institucional nem autoridade.

**Fundamentação.** O harness é substrato de coordenação distinto de framework de agente, de
ACI e de OS de agente; sua função é mediar, não conter o domínio. `[HARNESS-RT]` Componentes
do harness são desacoplados e editáveis isoladamente. `[AHE]`

**Implicação.** Lógica institucional pertence aos services; governança comportamental às
policies; o runtime apenas orquestra.

---

### P14 — Services e Tools executam as operações

**Enunciado.** A execução de operações é responsabilidade de services (lógica institucional) e
tools (execução controlada) — nunca do modelo.

**Fundamentação.** Tools são as conexões de execução (bancos, ERP, CRM, e-mail, browser);
o modelo apenas descreve a invocação. `[PYR]` O registro de ferramentas e a fronteira de
permissão são responsabilidades de runtime explícitas. `[HARNESS-RT]`

**Implicação.** Toda execução passa por uma tool registrada, com permissão explícita e trace.

---

### P15 — Specifications governam os contratos operacionais

**Enunciado.** O que uma classe de operações deve produzir é definido por specifications
versionadas e coerentes, não por convenção tácita.

**Fundamentação.** Specification engineering formaliza o corpus machine-readable de políticas,
padrões de qualidade e procedimentos — a constituição dos agentes. `[PYR]` Decomposição
contract-first: só se delega o que tem método de verificação precisamente definido. `[PYR]`

**Implicação.** Cada contrato operacional, comportamental, de execução, de política e de
tenant é um artefato de specification (ver camada `specification-engineering`).

---

### P16 — Harnesses orquestram a cognição operacional

**Enunciado.** A cognição operacional é orquestrada por harnesses — substratos de runtime que
expõem, traçam e governam os recursos que o agente usa.

**Fundamentação.** O harness define onze responsabilidades de runtime (interface de tarefa,
contexto, ferramentas, memória de projeto, estado de tarefa, observabilidade, atribuição de
falha, verificação, permissão, auditoria de entropia, registro de intervenção). `[HARNESS-RT]`
A evolução do harness é uma superfície externalizada e auditável onde a experiência se
acumula. `[AHE]`

**Implicação.** O YZI OS organiza-se em harnesses especializados (runtime, governança,
observabilidade, retrieval, auditoria, escalação, execução).

---

### P17 — Estado operacional é mais importante que memória conversacional

**Enunciado.** Quando houver tensão entre fidelidade ao estado persistido e fidelidade ao
histórico conversacional, o estado prevalece.

**Fundamentação.** Memória conversacional é opaca, não-portável e não-administrável como
controle; estado é a verdade recuperável e auditável. `[PYR]` A continuidade vem do arquivo,
não da memória do modelo. `[CE]`

**Implicação.** A conversa é projeção do estado; nunca o contrário.

---

### P18 — A linguagem deve ser desacoplada da operação

**Enunciado.** A capacidade de propor (linguagem) é arquiteturalmente separada da capacidade
de agir (operação).

**Fundamentação.** O LLM é "cérebro sem mãos": descreve, não executa. `[PYR]` Separação de
preocupações entre compreender, planejar, executar e avaliar. `[CE]`

**Implicação.** A camada linguística e a camada operacional comunicam-se por interfaces
explícitas; mudanças numa não rompem a outra.

---

## Princípios derivados de operação (consequências obrigatórias)

Os princípios abaixo não introduzem doutrina nova; são corolários operacionais dos `P1–P18`,
listados por serem requisitos arquiteturais explícitos.

- **DO1 — Cognição stateful.** O sistema modela cognição com estado contínuo, não como
  sequência de inferências sem memória. (← P3, P17)
- **DO2 — Isolamento contextual.** Composição de contexto sempre respeita fronteiras de
  visibilidade e atenuação de privilégio. `[PYR]` (← P10, P11)
- **DO3 — Orquestração de retrieval.** A recuperação é orquestrada por política, não ad hoc.
  (← P4, P5)
- **DO4 — Execução baseada em specification.** Nenhuma operação executa fora de um contrato.
  (← P15)
- **DO5 — Policy enforcement determinístico.** Políticas são aplicadas, não sugeridas. `[HE-GOV]`
  (← P12)
- **DO6 — Provenance tracking.** Cada fragmento de contexto e cada decisão carrega origem,
  momento e confiança. `[PYR]` (← P9)
- **DO7 — Behavioral traceability.** O comportamento é reconstruível a partir de traces. `[AHE]`
  (← P8, P9)
- **DO8 — Event-driven operational state.** O estado evolui por eventos auditáveis, não por
  mutação implícita. (← P3, P9)
- **DO9 — Verificação como runtime.** Conclusão vinculada a evidência determinística, com
  atribuição antes de recuperação. `[HARNESS-RT]` (← P8)
- **DO10 — Auditoria de entropia.** O sistema detecta e registra o ônus de manutenção
  introduzido por operações autônomas (resíduo, deriva, violação de fronteira). `[HARNESS-RT]`
  (← P9, P16)
