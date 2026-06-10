# YZI OS — Arquitetura de Agentes

> Documento de arquitetura. Define os agentes do YZI OS como **interface linguística
> institucional** — que **propõe**, mas não decide nem executa. Detalha a camada 4 da
> [arquitetura conceitual](conceptual-architecture.md).
>
> Camada: `architecture` · Status: canônico · Versão: v1
> Proveniência: `[CE]` `[PYR]`

---

## 1. Propósito e escopo

O agente é a **interface linguística institucional**: o ponto onde a intenção é recebida e
traduzida em operação proposta. (`P7`) Este documento define o papel arquitetural do agente e
seus limites. O **ciclo de vida**, a **memória** e a **governança** detalhados dos agentes
pertencem à camada `agents`.

Sem implementação: descrevemos o papel do agente, não frameworks de agente, prompts concretos
ou código.

---

## 2. O agente propõe; não decide nem executa

O agente traduz intenção em **operação proposta**. Ele **não decide** (isso é dos services) e
**não executa** (isso é das tools). (`P7` `P18`) É a manifestação, na camada linguística, do
eixo **linguagem ↔ operação**: o agente propõe em linguagem; a operação dispõe.

Arquiteturalmente, isto significa que o agente é uma **interface**, não um decisor autônomo.
A intenção do agente entra no fluxo como proposta a ser governada — nunca como comando soberano.

---

## 3. A proposta do agente é Metadata

Dentro do pacote de contexto de uma operação, a proposta/prompt do agente ocupa o papel de
**Metadata** — o de **menor** autoridade (Paradoxo do Metadado). `[CE]` A Authority (governança,
estado, specification) sobrepõe-se sempre.

Disto decorre uma propriedade de segurança: a eloquência do agente não pode sobrepor-se à
governança; o que o agente "diz" é a entrada de menor prioridade, e o que escapar é capturado
pela verificação independente. `[CE]` O agente **inicia** a operação; ele não a **governa**.

---

## 4. O agente é representante institucional

O agente é o **representante digital** que age em nome da instituição, sob suas regras e sua
responsabilidade. `[PYR]` Não é uma "IA falante" autônoma. A responsabilidade pelas ações recai
sobre a instituição que opera o agente — e a figura accountável é o **operador**. `[PYR]`

Por isso o agente opera sempre dentro do perímetro de um tenant, com a visibilidade e os direitos
que lhe foram atenuadamente concedidos (ver [arquitetura
multi-tenant](tenant-architecture.md)).

---

## 5. Agente ≠ LLM

É essencial distinguir o **agente** do **LLM**:

| | Agente | LLM |
| --- | --- | --- |
| Natureza | construto institucional (interface) | motor linguístico probabilístico |
| Papel | propõe operação no perímetro do tenant | compreende, raciocina, gera quando invocado |
| Autoridade | nenhuma sobre decisão/execução | nenhuma sobre a operação (`P1`) |
| Substituível? | configurável por specification/policy | sim, modelo trocável sem alterar o agente |

O agente **usa** o LLM como componente; o LLM não **é** o agente. `[PYR]` Trocar o modelo não
altera o agente, suas policies, sua memória ou seu contrato.

---

## 6. Delegação entre agentes

Quando um agente delega a um sub-agente, vale **delegação ≠ decomposição**: decompor parte a
tarefa; **delegar transfere autoridade, responsabilidade e confiança**. `[PYR]` A delegação
obedece à **atenuação de privilégio** (cada elo estreita os direitos) e à decomposição
**contract-first** (só se delega o verificável). `[PYR]` (`DO2`) Sem isso, a operação
multi-agente degenera num monólito distribuído com ilusão de independência. `[PYR]`

---

## 7. Fronteiras desta camada (o que NÃO está aqui)

- **Não** define ciclo de vida, memória ou governança detalhada dos agentes — isso é da camada
  `agents`.
- **Não** define a lógica de decisão (services) nem a execução (tools).
- **Não** define frameworks, prompts concretos ou código.

---

## 8. Conformidade com os princípios da fundação

| Princípio | Como esta arquitetura o instancia |
| --- | --- |
| `P7` agentes são interfaces institucionais | §2, §4 |
| `P18` linguagem desacoplada da operação | §2 (propõe ≠ dispõe) |
| `P1` LLM não é fonte de verdade | §5 (agente ≠ LLM) |
| `P10`/`DO2` isolamento e atenuação | §4, §6 |

Resolução de conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).
