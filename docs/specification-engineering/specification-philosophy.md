# YZI OS — Filosofia de Specification

> Camada `specification-engineering`. Define por que e como o conhecimento institucional se
> torna um corpus machine-readable governante. Detalha a §8 da [arquitetura
> conceitual](../architecture/conceptual-architecture.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[PYR]` `[HE-GOV]` `[HARNESS-RT]`

---

## 1. Propósito

Define a **filosofia de specification engineering** do YZI OS: a transição da arquitetura
conceitual para **specifications executáveis**. Sem implementação.

## 2. Specifications são a constituição

Specifications são a **constituição** dos agentes: as intenções são as leis promulgadas sob ela,
o contexto é sua aplicação, e o prompt é uma ação pontual numa situação específica. `[PYR]`
(`P15`) Cada agente "abre o artigo certo no momento certo" e age dentro de limites definidos antes
de sua execução. `[PYR]`

## 3. Conhecimento institucional como infraestrutura machine-readable

Specification engineering é a disciplina de criar o **corpus completo, coerente e versionado** de
políticas, padrões de qualidade, procedimentos e acordos — tudo o que antes vivia em PDFs, ordens
e "todo mundo já sabe". `[PYR]` Está para os agentes como o ERP está para os processos: roda sobre
procedimentos **codificados**, não acordos verbais. `[PYR]`

## 4. Dívida de specification

Todo agente criado sem specification carrega **specification debt**: opera sem normas formalizadas
e decide por heurísticas extraídas do contexto disponível. `[PYR]` Com poucos agentes, gerenciável;
em escala, crise de governança. **Quanto mais fácil criar, mais crítico definir o que "criado bem"
significa.** `[PYR]`

## 5. Contract-first

Uma operação só é especificada/delegada quando possui **método de verificação precisamente
definido**; caso contrário, é decomposta recursivamente até cada parte ser verificável. `[PYR]`
A specification começa pela **verificação**, não pela tarefa: define-se primeiro como o resultado
será comprovado.

## 6. Specification como disciplina institucional

SE não é habilidade individual de escrever um contrato: é disciplina **institucional** — quem cria,
quem verifica a coerência entre departamentos, como se versiona e atualiza quando a estratégia
muda. `[PYR]` Coerência entre specifications é um requisito de primeira classe.

## 7. Tipologia dos contratos do YZI OS

Esta camada define cinco famílias de contrato, detalhadas em documentos próprios:
- **operational-specifications** — o que uma classe de operação deve produzir.
- **behavioral-contracts** — o que o agente deve buscar e o que pode/não pode (intenção).
- **execution-contracts** — o que a execução (services/tools) pode fazer e como se verifica.
- **policy-contracts** — o que é permitido/proibido/quando escalar.
- **tenant-contracts** — a especialização e o isolamento por tenant.

## 8. Fronteiras (o que NÃO está aqui)

- **Não** consolida o PRD — Fase 3.
- **Não** define schema, formato concreto, código ou backlog.
- **Não** define o enforcement em si — camada `governance` (posterior).

## 9. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P15` specifications governam contratos | §2, §3, §7 |
| `P12` governança separada da linguagem | Corpus codificado (§3) |
| `DO4` execução baseada em specification | §5 (contract-first) |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).
