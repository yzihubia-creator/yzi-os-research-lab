# YZI OS — Arquitetura de Runtime

> Documento de arquitetura (espinha dorsal). Define o **runtime leve** do YZI OS: o que ele
> coordena, o que ele deliberadamente **não** faz, e como permanece sem autoridade
> comportamental. Detalha a camada 7 da [arquitetura conceitual](conceptual-architecture.md).
>
> Camada: `architecture` · Status: canônico · Versão: v1
> Proveniência: `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]`

---

## 1. Propósito e escopo

O runtime é a camada de **coordenação** do YZI OS. Este documento define seu papel real e,
sobretudo, seus **limites**: o runtime executa, mas **não governa o comportamento**. (`P6` `P13`)

Não há implementação aqui. Descrevemos o runtime como **substrato conceitual de coordenação**
(harness), não como serviço ou processo.

---

## 2. O que o runtime é: um harness

O runtime do YZI OS é um **harness**: um substrato externo ao modelo que media como o agente
**observa** o ambiente, **age** sobre ele, **recebe feedback** e **estabelece conclusão**. `[HARNESS-RT]`

O harness é distinto de tudo o que costuma ser confundido com ele: `[HARNESS-RT]`

- não é um **prompt** (que molda uma única invocação);
- não é um **framework de agente** (que compõe agentes e tools);
- não é uma **interface agente–computador** (que é apenas um de seus componentes);
- não é um **sistema operacional de agente** genérico;
- não é um **harness de avaliação** (que mede comportamento; este o **molda**).

Conceitualmente, o harness é onde a capacidade latente do modelo se torna comportamento
auditável — sem que o harness, ele próprio, decida o comportamento. `[HARNESS-RT]`

---

## 3. O princípio do runtime leve

> **Restringir o runtime habilita mais autonomia.** `[HE-GOV]`

A confiança para delegar operação a um agente cresce na exata medida em que o espaço de ação é
deliberadamente estreitado. Mas estreitar não é o mesmo que **governar**: o runtime aplica
fronteiras e coordena, enquanto a **autoridade comportamental** (o que é permitido, o que a
operação deve produzir) permanece nas camadas de estado, retrieval e policies. (`P6`)

O runtime é leve por princípio: ele **não** acumula lógica institucional (que pertence aos
services) nem governança comportamental (que pertence às policies/specifications). (`P13`) Seus
componentes são desacoplados e editáveis isoladamente. `[AHE]`

---

## 4. As responsabilidades de coordenação do runtime

O harness expõe um conjunto fixo de **responsabilidades de runtime**. `[HARNESS-RT]` No YZI OS,
elas se distribuem assim — observe que cada uma **coordena ou expõe** um recurso, sem deter
autoridade sobre ele:

| Responsabilidade de runtime | O que coordena/expõe | Autoridade pertence a |
| --- | --- | --- |
| **Task interface** | apresenta objetivo, requisitos e critérios | specification (`P15`) |
| **Context manager** | seleciona e expõe contexto relevante | governance/state (`P4` `P11`) |
| **Tool registry** | declara tools disponíveis e comandos permitidos | services/policies (`P14`) |
| **Project memory** | expõe conhecimento de projeto recuperável | state (`P3`) |
| **Task state** | mantém hipótese, passos, questões abertas | state (`P17`) |
| **Observability layer** | expõe logs, traces, saídas | observability (`P8`) |
| **Failure attribution** | separa observação, esperado e diagnóstico | observability (`DO9`) |
| **Verification protocol** | mapeia requisitos a evidência determinística | governance (`DO9`) |
| **Permission boundary** | restringe ações arriscadas; expõe gates | policies (`P12`) |
| **Entropy auditor** | detecta ônus de manutenção introduzido | observability (`DO10`) |
| **Intervention logger** | registra assistência humana e sua evitabilidade | observability (`P9`) |

A coluna direita é o ponto inteiro deste documento: o runtime **coordena** as onze
responsabilidades, mas a **autoridade** sobre cada recurso vive fora dele.

---

## 5. O ciclo de coordenação

Conceitualmente, o runtime executa um laço de controle — observar estado, montar contexto,
coordenar a ação, registrar evidência — análogo ao laço de controle de sistemas cibernéticos
(observar → controlar → iterar). `[HE-GOV]` Em cada operação ele:

1. **monta** o pacote de contexto (composição just-in-time, isolamento de tenant); `[PYR]`
2. **roteia** a operação à governança e aos services apropriados;
3. **orquestra** a invocação de tools sob fronteira de permissão;
4. **registra** traces, verificação e proveniência na observabilidade.

Em uma frase, o perímetro do runtime é exatamente este:

> O runtime **monta contexto, roteia, coordena, chama tools, registra eventos e aciona
> verificações** — mas **não decide a verdade operacional nem governa o comportamento**.

O runtime **não** decide (o passo de decisão é dos services), **não** define o que é permitido
(policies), **não** define o que a operação deve produzir (specification) e **não** é a fonte de
verdade (o estado é). Ele garante apenas que cada passo ocorra na ordem governada e seja
observável. Acionar uma verificação não é o mesmo que julgá-la: o critério de aprovação pertence
à governança; o runtime apenas a dispara e registra o resultado.

---

## 6. Observabilidade do próprio runtime

A evolução e a operação do runtime são governadas por três pilares de observabilidade: `[AHE]`

- **Component observability** — cada componente do harness é um artefato isolado e reversível;
  cada mudança mapeia a um componente, com reversão em granularidade fina.
- **Experience observability** — traços brutos são destilados em um corpus de evidência em
  camadas, consumível por divulgação progressiva. `[AHE]`
- **Decision observability** — cada decisão/edição de coordenação é pareada a uma **predição
  falsificável**, verificada contra o resultado seguinte — tornando-se um **contrato**
  versionado. `[AHE]` (`DO7`)

---

## 7. O invariante de controlabilidade

O runtime opera sob um invariante de governança herdado da observabilidade: **o componente que
executa não pode desligar sua própria fiscalização**. `[AHE]`

Concretamente, no plano conceitual: o **verificador**, o **tracer** e a **configuração de
governança** são **read-only** para o executor. Isso bloqueia os atalhos que um auto-modificador
não-restrito tomaria — desabilitar a verificação, trocar o modelo, ampliar o orçamento — e
mantém todo ganho e toda ação **atribuíveis**. `[AHE]` (`P9`) É a contraparte de runtime do
princípio "confie na arquitetura, não no modelo". `[CE]`

---

## 8. Independência de modelo e de agente

Como a autoridade comportamental vive fora do runtime e do modelo, o sistema preserva duas
independências:

- **Independência de modelo.** O LLM é um componente substituível; o harness, o estado, as
  policies e as specifications não dependem de qual modelo está sob o capô. `[PYR]` O sistema
  mantém suas propriedades operacionais sob substituição de provedor. `[CE]` (`P1`)
- **Independência de agente.** Com enforcement suficientemente abrangente, a identidade de quem
  produziu a operação é irrelevante ao resultado estrutural. `[HE-GOV]`

---

## 9. Fronteiras desta camada (o que NÃO está aqui)

- **Não** define a semântica de decisão/execução de uma operação — isso é da [arquitetura
  operacional](operational-architecture.md).
- **Não** define persistência e continuidade — isso é da [arquitetura de
  estado](state-architecture.md).
- **Não** define os harnesses especializados em detalhe (governança, observabilidade,
  retrieval, auditoria, escalação, execução) — isso é da camada `harness-engineering`.
- **Não** contém código, processo, API, schema nem topologia de deploy.

---

## 10. Conformidade com os princípios da fundação

| Princípio | Como esta arquitetura o instancia |
| --- | --- |
| `P6` runtime executa, não governa | Coluna "autoridade pertence a" (§4); §3, §5 |
| `P13` runtime leve | Princípio do runtime leve (§3) |
| `P16` harnesses orquestram cognição | Harness e responsabilidades (§2, §4) |
| `P1`/`P18` LLM sem autoridade | Independências (§8) |
| `P9` ação auditável | Controlabilidade read-only (§7); decision observability (§6) |
| `DO7` rastreabilidade comportamental | Pilares de observabilidade (§6) |

A resolução de conflitos entre princípios segue a **ordem de valores** de
[`principles.md`](../foundation/principles.md).
