# YZI OS — Arquitetura de Services

> Documento de arquitetura. Define a camada de **services** do YZI OS — a lógica
> institucional que **decide** — e sua relação com tools e specifications. Detalha a camada 2
> da [arquitetura conceitual](conceptual-architecture.md).
>
> Camada: `architecture` · Status: canônico · Versão: v1
> Proveniência: `[PYR]` `[HE-GOV]` `[HARNESS-RT]`

---

## 1. Propósito e escopo

Os services são a camada da **lógica institucional, das regras operacionais e das validações**.
São eles que **decidem** a operação. (`P2` `P14`) Este documento define o papel decisório dos
services e sua fronteira com a execução (tools) e com os contratos (specifications).

Sem implementação: descrevemos o papel arquitetural dos services, não microservices, APIs,
endpoints ou código.

---

## 2. O princípio: o backend decide

Numa arquitetura centrada no modelo, a decisão é delegada à inferência. No YZI OS, **a decisão
é uma responsabilidade do backend**. (`P2`) O modelo informa; os services decidem; o estado
registra.

A decisão é uma propriedade de **lógica institucional verificável** — não de geração
probabilística. Por isso a autoridade decisória da [arquitetura conceitual](conceptual-architecture.md)
reside aqui, e não na camada linguística nem no runtime.

---

## 3. Services decidem dentro de contratos

Os services não decidem livremente: decidem **dentro do contrato de specification aplicável**.
`[PYR]` (`P15`) A specification define o que aquela classe de operação deve produzir; o service
aplica a lógica institucional para chegar à decisão **dentro** desse contrato.

Vale a decomposição **contract-first**: uma operação só é decidida/delegada quando possui método
de verificação precisamente definido; caso contrário, é decomposta recursivamente até cada parte
ser verificável. `[PYR]` A decisão do service é, assim, sempre uma decisão **verificável**.

---

## 4. Services vs. Tools: decidir vs. executar

A fronteira entre services e tools é a fronteira entre **decidir** e **executar**:

| | Services | Tools |
| --- | --- | --- |
| Papel | lógica institucional, regras, validação | execução operacional controlada |
| Verbo | **decidem** | **executam** |
| Autoridade | sobre a decisão (dentro do contrato) | nenhuma — agem sob permissão |
| Saída | a operação decidida | o efeito da operação no mundo |

Os services determinam **o que** fazer; as tools realizam **a ação**, sob fronteira de permissão
explícita e com trace de cada invocação. `[HARNESS-RT]` (`P14`) O modelo apenas descreve a
invocação; nem service nem tool delegam decisão ao modelo. `[PYR]`

---

## 5. Validação institucional

Os services concentram a **validação**: as regras que determinam se uma operação é admissível,
coerente e conforme. A validação dos services é a contraparte de **decisão** do enforcement de
governança (que é a contraparte de **permissão**). Juntas, governança e services garantem que
nenhuma operação fora de contrato ou fora de política prossiga. (`DO4` `DO5`)

---

## 6. Services não acumulam coordenação nem governança

Para manter a separação de preocupações:

- os services **não coordenam** (montagem de contexto, roteamento, orquestração são do runtime);
- os services **não governam comportamento** (o permitido/proibido é das policies);
- os services **não são a verdade** (a verdade é o estado).

Os services contêm a **lógica de decisão institucional** — e apenas isso. Isso mantém o runtime
leve (`P13`) e a governança separada da linguagem (`P12`).

---

## 7. Fronteiras desta camada (o que NÃO está aqui)

- **Não** define microservices, APIs, endpoints, contratos de interface ou código.
- **Não** define os contratos de execução em si — isso é da camada `specification-engineering`.
- **Não** define a coordenação (runtime) nem a execução concreta (tools).

---

## 8. Conformidade com os princípios da fundação

| Princípio | Como esta arquitetura o instancia |
| --- | --- |
| `P2` backend decide | §2, §3 |
| `P14` services/tools executam operações | §4 (decidir vs. executar) |
| `P15` specifications governam contratos | §3 (decisão dentro do contrato) |
| `P13` runtime leve | §6 (services não coordenam) |
| `DO4` execução baseada em specification | §3 |

Resolução de conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md) —
verdade operacional (1ª) e governança institucional (5ª) emolduram a decisão dos services.
