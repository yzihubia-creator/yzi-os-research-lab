# YZI OS — Arquitetura de Governança

> Documento de arquitetura. Define a governança comportamental do YZI OS — **RAG + XML +
> Policies** — como camada que **restringe** o comportamento de forma determinística,
> separada da linguagem. Detalha a camada 3 da [arquitetura
> conceitual](conceptual-architecture.md).
>
> Camada: `architecture` · Status: canônico · Versão: v1
> Proveniência: `[CE]` `[PYR]` `[HE-GOV]`

---

## 1. Propósito e escopo

A governança é a camada que **decide o que é permitido** e **verifica o que foi feito** — em
termos comportamentais. Ela governa o comportamento dos agentes sem residir na linguagem deles.
(`P5` `P12`)

Sem implementação: descrevemos o modelo de governança, não motores de regra, formatos XML
concretos ou pipelines de política.

---

## 2. O princípio: governança fora da linguagem

Se a governança vivesse no prompt, seria **probabilística** — sujeita à eloquência, à injeção e
à deriva. A governança do YZI OS é **estrutural e determinística**. (`P12`)

A engenharia de harness fornece a distinção fundadora: `[HE-GOV]`

- **Guidance** (pré-geração) — instruções, exemplos, contexto. Aumenta a probabilidade de
  conformidade; **não a garante**. "Guidance demais vira não-guidance." `[HE-GOV]`
- **Enforcement** (pós-geração) — regras, validações, gates. Produz veredito **pass/fail
  determinístico**, independente de qual agente produziu a operação.

Daí a **independência de agente**: com enforcement abrangente, a identidade do autor da
operação é irrelevante ao resultado estrutural. `[HE-GOV]` E o paradoxo produtivo: **restringir
habilita autonomia** — confiança para delegar cresce com o estreitamento deliberado do espaço de
ação. `[HE-GOV]`

---

## 3. Os três componentes da governança comportamental

| Componente | Função | Regime |
| --- | --- | --- |
| **RAG** (retrieval) | governa o que o agente sabe — e, portanto, como se comporta | enforcement do que entra no contexto (`P4`) |
| **XML / contratos** | declara estrutura e contrato da operação | enforcement estrutural |
| **Policies** | declara o que é permitido, proibido, e quando escalar | enforcement determinístico (`DO5`) |

A combinação dos três é o que governa o agente (`P5`). O retrieval governado é detalhado na
[arquitetura de retrieval](retrieval-architecture.md); os contratos, na camada
`specification-engineering`; o detalhamento das policies, na camada `governance`.

---

## 4. A tríade Context · Constraint · Convergence

A governança opera segundo a tríade da engenharia de harness: `[HE-GOV]`

- **Context** — o conhecimento que informa o agente (declarativo: o que existe; procedural:
  como decidir). Informa.
- **Constraint** — as regras que governam a saída: **Guidance** (pré) + **Enforcement** (pós).
  Governa.
- **Convergence** — o refino iterativo das regras até a **idempotência estrutural** (reaplicar
  não produz nova mudança). Avalia e evolui.

As três formam um laço de governança: o contexto informa, a constraint governa, a convergência
avalia e realimenta. `[HE-GOV]`

---

## 5. Authority dentro da operação

A governança não atua só **entre** camadas, mas **dentro** de cada operação, via prioridade do
pacote de contexto: **Authority › Exemplar › Constraint › Rubric › Metadata**, com o prompt do
agente no nível **Metadata** — o de menor autoridade (Paradoxo do Metadado). `[CE]` Assim, mesmo
dentro de uma única operação, a Authority (governança) sobrepõe-se à linguagem (Metadata).

Isto também é uma defesa: uma instrução injetada em um elemento de menor prioridade **não pode**
legitimamente sobrepor-se a uma Authority — e o que escapar é capturado pela verificação
independente. `[CE]`

---

## 6. Redução do espaço de escolha

A governança estreita o espaço de decisões permissíveis por três mecanismos de força crescente:
`[HE-GOV]`

- **eliminação** — mandar uma única opção;
- **canalização** — restringir a um vocabulário curado;
- **canonicalização** — garantir que qualquer escolha convirja a um resultado estrutural idêntico.

Quanto mais abrangente o enforcement, mais o resultado torna-se propriedade da governança, não
do autor.

---

## 7. Specifications como constituição

A governança comportamental é, em última instância, a **aplicação de uma constituição**: as
specifications definem o que cada classe de operação deve produzir; as intenções são as leis; o
contexto é a aplicação; o prompt é uma ação pontual. `[PYR]` (`P15`) A governança aplica e
verifica essa constituição operação a operação. O corpus em si pertence à camada
`specification-engineering`.

---

## 8. A ordem de valores na governança

Quando a aplicação de políticas exige resolver tensões, a governança preserva a **ordem de
valores** institucional: verdade operacional › segurança › isolamento multi-tenant ›
auditabilidade › governança institucional › continuidade de estado › desacoplamento
linguagem/operação › leveza do runtime. (Ver [`principles.md`](../foundation/principles.md).) Esta
ordem — não a numeração dos princípios — governa a decisão.

---

## 9. Fronteiras desta camada (o que NÃO está aqui)

- **Não** define o conteúdo das policies nem dos contratos — isso é das camadas `governance` e
  `specification-engineering`.
- **Não** define o pipeline de retrieval — isso é da [arquitetura de
  retrieval](retrieval-architecture.md).
- **Não** define motores de regra, formatos concretos ou código.

---

## 10. Conformidade com os princípios da fundação

| Princípio | Como esta arquitetura o instancia |
| --- | --- |
| `P4` retrieval governa comportamento | RAG como componente (§3) |
| `P5` RAG + Policies governam agentes | §3 |
| `P12` governança separada da linguagem | Guidance↔Enforcement (§2) |
| `P15` specifications governam contratos | Constituição (§7) |
| `DO5` policy enforcement determinístico | §2, §3, §6 |

Resolução de conflitos: **ordem de valores** (§8).
