# YZI OS — Arquitetura de Observabilidade

> Documento de arquitetura. Define a observabilidade do YZI OS como camada de **auditoria,
> rastreabilidade e análise operacional** — a que **comprova**. Detalha a camada 6 da
> [arquitetura conceitual](conceptual-architecture.md).
>
> Camada: `architecture` · Status: canônico · Versão: v1
> Proveniência: `[CE]` `[PYR]` `[AHE]` `[HARNESS-RT]`

---

## 1. Propósito e escopo

A observabilidade é a camada que torna toda operação **rastreável, auditável e analisável**.
Ela não executa nem decide: ela **comprova**. Sua autoridade é sobre a evidência — não sobre o
comportamento. (`P8` `P9`)

Sem implementação: descrevemos o modelo de observabilidade, não dashboards, agentes de log ou
pipelines técnicos.

---

## 2. Posição na inversão de governança

A observabilidade é a contraparte de prova da inversão "confie na arquitetura, não no modelo".
`[CE]` Se o estado é a verdade e a governança é a restrição, a observabilidade é a **demonstração
verificável** de que a verdade foi preservada e a restrição foi respeitada. É obrigatória por
princípio (`P8`): sucesso não verificável e falha não diagnosticável são inaceitáveis. `[HARNESS-RT]`

---

## 3. O episódio como objeto auditável

A unidade de observabilidade é o **pacote de episódio** (ver [arquitetura
operacional](operational-architecture.md)): o registro auditável de uma operação. `[HARNESS-RT]`
Ele contém, no mínimo:

- **traces** de ação, de tool, de contexto e de verificação;
- **relatório de verificação** (requisitos ↔ evidência);
- **log de atribuição de falha**;
- **auditoria de entropia**;
- **registro de intervenção** humana;
- **registro de resultado** com a classificação final.

A trilha de auditoria **forma-se organicamente** quando cada estágio preserva sua própria saída
— não é um esforço documental à parte. `[CE]` (`P9`)

---

## 4. Os três pilares de observabilidade

A observabilidade do YZI OS organiza-se em três pilares. `[AHE]`

- **Component observability** — cada componente do sistema (e do harness) é um artefato isolado
  e reversível; cada mudança mapeia a um componente, com reversão em granularidade fina.
- **Experience observability** — traços brutos são destilados em um **corpus de evidência em
  camadas**, consumível por **divulgação progressiva** (raiz → drill-down), economizando custo
  e melhorando a análise. `[AHE]`
- **Decision observability** — cada decisão relevante é pareada a uma **predição falsificável**,
  verificada contra o resultado seguinte; torna-se um **contrato versionado** confirmado ou
  revertido. `[AHE]` (`DO7`)

---

## 5. Atribuição de falha

A atribuição **separa observação, comportamento esperado e diagnóstico**, e ocorre **antes** de
qualquer nova ação corretiva. `[HARNESS-RT]` Isso evita "remendos aleatórios": o sistema não
passa de uma falha observada diretamente a uma nova ação sem antes classificar a causa.

A atribuição é auditável: registra saída observada, saída esperada, tipo de falha, evidência,
explicações alternativas e a próxima ação diagnóstica. `[HARNESS-RT]` Complementa-a o princípio
do **auditor independente** — quem executou não audita. `[CE]`

---

## 6. Proveniência

Cada fragmento de contexto e cada transição de estado carregam **proveniência**: origem,
momento e nível de confiança. `[PYR]` (`DO6`) A proveniência é o que permite responder, depois
de uma decisão, **qual** fragmento a provocou — questão impossível de responder sem ela. `[PYR]`
A observabilidade é a guardiã da proveniência ao longo de todo o episódio.

---

## 7. Auditoria de entropia

A observabilidade detecta e registra o **ônus de manutenção** introduzido por operações
autônomas: estado obsoleto, deriva, enfraquecimento de verificação, violação de fronteira. `[HARNESS-RT]`
(`DO10`) A entropia é tratada **dentro do laço**, não como preocupação externa.

---

## 8. Intervenção humana como sinal diagnóstico

A intervenção humana **não é ruído**: é sinal de uma responsabilidade de governança ausente. `[HARNESS-RT]`
A observabilidade registra cada intervenção, sua evitabilidade e a fronteira de governança a que
corresponde — convertendo cada intervenção evitável em uma lacuna a fechar.

---

## 9. Relação com a controlabilidade do runtime

A observabilidade sustenta o **invariante de controlabilidade** descrito na [arquitetura de
runtime](runtime-architecture.md): o **verificador**, o **tracer** e a **configuração de
governança** são read-only para o executor. `[AHE]` Assim, o executor não pode desligar sua
própria fiscalização, e todo ganho ou ação permanece **atribuível**. (`P9`)

---

## 10. Fronteiras desta camada (o que NÃO está aqui)

- **Não** define dashboards, formato de logs, ferramentas de tracing ou pipelines técnicos.
- **Não** define o que é permitido (governança) nem o que é verdade (estado).
- **Não** define a semântica da operação observada — isso é da arquitetura operacional.

---

## 11. Conformidade com os princípios da fundação

| Princípio | Como esta arquitetura o instancia |
| --- | --- |
| `P8` observabilidade obrigatória | §2, §3 (episódio sempre produz evidência) |
| `P9` ação auditável | Pacote de episódio (§3); trilha orgânica |
| `DO6` provenance tracking | §6 |
| `DO7` rastreabilidade comportamental | Três pilares (§4) |
| `DO9` verificação como runtime | Atribuição antes de recuperação (§5) |
| `DO10` auditoria de entropia | §7 |

Resolução de conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md)
(auditabilidade é a 4ª posição, diretamente sustentada por esta camada).
