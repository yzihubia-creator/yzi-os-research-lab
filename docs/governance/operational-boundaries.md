# YZI OS — Fronteiras Operacionais

> Camada `governance`. Define as fronteiras que delimitam o que pode ser operado. Complementa a
> [governança de políticas](policy-governance.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[HE-GOV]` `[PYR]` `[HARNESS-RT]`

---

## 1. Propósito

Define as **fronteiras operacionais**: permissão, contrato, isolamento e a fronteira decidir ≠
executar. Sem implementação.

## 2. Fronteira de permissão

Toda ação ocorre dentro de uma **fronteira de permissão explícita**; ações arriscadas exigem gates
de aprovação; ações fora da fronteira são bloqueadas. `[HARNESS-RT]` (`P14`) A permissão é
determinística, não negociável pelo agente.

## 3. Fronteira decidir ≠ executar

Os services decidem (dentro do contrato); as tools executam; o modelo apenas descreve a invocação.
`[PYR]` (`P2` `P14`) Nenhuma camada cruza essa fronteira: o runtime não decide, o agente não
executa, o modelo não governa.

## 4. Redução do espaço de escolha

As fronteiras estreitam o espaço de decisões por **eliminação, canalização e canonicalização**.
`[HE-GOV]` Quanto mais abrangentes, mais o resultado torna-se propriedade da governança
(independência de agente). "Restringir habilita autonomia." `[HE-GOV]`

## 5. A ordem de valores como fronteira última

A fronteira final é a **ordem de valores**: verdade operacional › segurança › isolamento
multi-tenant › auditabilidade › governança institucional › continuidade de estado › desacoplamento
linguagem/operação › leveza do runtime. Nenhuma operação pode violar um valor superior por um
inferior. (Ver [`principles.md`](../foundation/principles.md).)

## 6. Fronteiras (o que NÃO está aqui)

- **Não** define o conteúdo das policies — ver [policy-contracts](../specification-engineering/policy-contracts.md).
- **Não** define o substrato de execução — ver [execution-harness](../harness-engineering/execution-harness.md).
- **Não** define código.

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P2`/`P14` backend decide / services executam | §3 |
| `P12` governança separada da linguagem | §2, §4 |
| `DO5` policy enforcement determinístico | §2, §4 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).
