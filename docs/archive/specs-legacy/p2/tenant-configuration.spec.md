# tenant-configuration

> **Specification documental (governança-first, contract-first, linguagem natural estruturada).**
> Primeira spec do grupo **Multi-Tenant** da Onda P2. Define o que é **configuração de tenant** no
> YZI OS: **configuração institucional**, não customização livre. A configuração **parametriza** a
> personalização (verticalização) de cada tenant **subordinada aos princípios core**, e a
> verticalização ocorre por **configuration, contracts, policies, retrieval scope e services/tools
> autorizados — nunca por ruptura da arquitetura**. **Não** é machine-readable: não contém YAML, JSON,
> schema, DSL, pseudo-código nem contrato técnico executável.
>
> Onda: P2 (governança + contexto) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `tenant-configuration` |
| **Camada** | `tenant` / `governance` |
| **Owner arquitetural** | Multi-Tenant |
| **Tenant-scope** | Per-tenant (instância por tenant, sob definição global) |
| **Classe de operação** | configuração-institucional |
| **Candidatura** | `harness` (`tenant-harness`) |
| **Dependências** | [`tenant-boundary`](../p0/tenant-boundary.spec.md), [`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md), [`core-operational-principles`](../p0/core-operational-principles.spec.md), [`layer-authority-model`](../p0/layer-authority-model.spec.md), [`conflict-resolution`](../p0/conflict-resolution.spec.md), [`policy-enforcement`](policy-enforcement.spec.md) |
| **Proveniência** | `[HE-GOV]` `[PYR]` `[AHE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — isolamento multi-tenant; verticalização sem ruptura; subordinação aos princípios core.
- [`/docs/foundation/manifesto.md`](../../foundation/manifesto.md) §5 — "confie na arquitetura"; configuração parametriza, não reescreve.
- [`/docs/specs/p0/tenant-boundary.spec.md`](../p0/tenant-boundary.spec.md) — verticalização por configuração, **não** por fork/bifurcação insegura.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, o que é **configuração de tenant** no YZI OS: o
mecanismo institucional pelo qual cada tenant é **parametrizado e verticalizado** — sua personalização
operacional — **sem** alterar as leis da arquitetura. A configuração é **institucional**, não
customização livre: ela escolhe **dentro** do espaço governado, nunca **expande** esse espaço nem
suspende princípios, fronteiras, policies ou estado.

A spec **extrai** (não inventa nem resume) o isolamento multi-tenant, a verticalização sem ruptura e a
subordinação aos princípios core. **Abre** o grupo Multi-Tenant da Onda P2.

---

## 2. Problema que resolve

Tratar a personalização de tenant como **customização livre** levaria a forks, exceções e rupturas:
cada cliente "puxando" a arquitetura para um lado, quebrando isolamento, autoridade e auditabilidade.
Verticalizar por bifurcação multiplica superfícies de risco e dissolve a verdade operacional comum.

Esta spec elimina o risco fixando a configuração como **parametrização subordinada**: a verticalização
acontece por configuration, contracts, policies, retrieval scope e services/tools autorizados —
**dentro** da arquitetura, **nunca** rompendo-a.

---

## 3. Autoridade envolvida

- **Governa a configuração:** as **Specifications/Policies** (Authority) e o `tenant-harness`, com o
  **Estado** como verdade e os **princípios core** como limite inviolável.
- **Aplica (não cria exceção):** o **Runtime/Services** aplicam a configuração do tenant **dentro** dos
  contratos — não ampliam escopo nem suspendem regra.
- **NÃO reconfiguram a arquitetura:** **LLM, agente e prompt** não definem nem alteram configuração de
  tenant; configuração **não** é decidida em linguagem (`P1`, `P12`).

---

## 4. Entradas esperadas

- A **definição institucional** do tenant: parâmetros de verticalização declarados (contratos, policies
  aplicáveis, escopo de retrieval, services/tools autorizados).
- Os **princípios core** e as **fronteiras** que a configuração **não pode** violar
  ([`core-operational-principles`](../p0/core-operational-principles.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md)).

## 5. Saídas esperadas

- Um tenant **parametrizado e verticalizado** dentro da arquitetura: personalização institucional ativa,
  isolamento preservado, princípios intactos.
- O **registro auditável** da configuração vigente por tenant (o que foi parametrizado, por qual
  autoridade, quando).

---

## 6. Contrato esperado (linguagem natural)

1. Tenant configuration **é configuração institucional**, **NÃO** customização livre.
2. A configuração **define a personalização/verticalização** do tenant, mas **subordinada aos
   princípios core do YZI OS** — nunca acima deles.
3. A **verticalização DEVE acontecer por** configuration, **contracts, policies, retrieval scope e
   services/tools autorizados** — **NUNCA por ruptura da arquitetura** (fork/bifurcação insegura,
   exceção fora de contrato).
4. A configuração **escolhe dentro** do espaço governado; **NÃO DEVE** expandir esse espaço, criar
   autoridade nova nem suspender princípios, fronteiras, policies ou estado.
5. A configuração **NÃO DEVE** conceder acesso cross-tenant nem enfraquecer o isolamento
   ([`tenant-boundary`](../p0/tenant-boundary.spec.md), [`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md)).
6. A configuração **NÃO DEVE** elevar a autoridade do LLM/agente/prompt nem contornar o enforcement
   ([`policy-enforcement`](policy-enforcement.spec.md)).
7. A configuração de tenant **DEVE** ser **declarada, auditável e versionável** (em sentido documental),
   com proveniência da autoridade que a definiu.
8. Em caso de **conflito entre configuração e princípio/fronteira**, prevalece o princípio/fronteira; a
   configuração é **bloqueada ou escalada** ([`conflict-resolution`](../p0/conflict-resolution.spec.md), [`escalation-policy`](escalation-policy.spec.md)).

---

## 7. Configuração institucional × customização livre

| Dimensão | **Configuração institucional** (YZI OS) | **Customização livre** (rejeitada) |
| --- | --- | --- |
| O que faz | parametriza escolhas **dentro** da arquitetura | altera/expande a própria arquitetura |
| Limite | subordinada aos princípios core | "tudo é possível se o cliente pedir" |
| Mecanismo | configuration/contracts/policies/retrieval scope/services-tools autorizados | fork, exceção fora de contrato, bypass |
| Autoridade | definida por Authority, aplicada por Services | decidida em prompt/linguagem |
| Isolamento | preservado por construção | comprometido por bifurcação |
| Auditabilidade | declarada, proveniente, versionável | difusa, não rastreável |

Verticalizar é **escolher dentro do governado**, não **reescrever o governo**.

---

## 8. Eixos legítimos de verticalização

A personalização de um tenant ocorre **somente** por estes eixos, todos governados:

1. **Configuration** — parâmetros institucionais declarados.
2. **Contracts** — contratos de specification aplicáveis ao tenant.
3. **Policies** — policies de comportamento/enforcement instanciadas por tenant (prepara `tenant-policy-pack`).
4. **Retrieval scope** — alcance de recuperação por tenant (prepara `tenant-retrieval-scope`).
5. **Services/Tools autorizados** — o conjunto de execução habilitado para o tenant.

Nenhum outro eixo verticaliza. Nada fora destes eixos pode "personalizar" o tenant rompendo a
arquitetura.

---

## 9. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Tratar a configuração de tenant como **institucional**, não customização livre.
2. Manter a configuração **subordinada aos princípios core** (nunca acima deles).
3. Verticalizar **apenas** pelos cinco eixos governados (§8); nunca por ruptura/fork/exceção.
4. Impedir que a configuração expanda escopo, crie autoridade ou suspenda princípio/fronteira/policy/
   estado.
5. Impedir acesso cross-tenant e qualquer enfraquecimento do isolamento.
6. Impedir que a configuração eleve LLM/agente/prompt ou contorne enforcement.
7. Manter a configuração declarada, auditável, versionável e proveniente.
8. Resolver conflito configuração×princípio a favor do princípio (bloqueio/escalada registrada).

---

## 10. Critérios de aceite

1. Referencia o isolamento multi-tenant, a verticalização sem ruptura e os princípios core sem
   contradizê-los nem duplicá-los.
2. Fixa configuração institucional × customização livre (§6, §7).
3. Fixa a subordinação aos princípios core.
4. Fixa os cinco eixos governados de verticalização (§8) e a proibição de ruptura.
5. Fixa a não-elevação de autoridade, o não-cross-tenant e o respeito ao enforcement.
6. Exige configuração declarada/auditável/proveniente; revisável por humano.

---

## 11. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Trata configuração de tenant como customização livre.
2. Coloca a configuração acima dos princípios core ou permite suspendê-los.
3. Verticaliza por ruptura da arquitetura (fork, exceção fora de contrato, bypass).
4. Permite a configuração expandir escopo, criar autoridade nova ou conceder acesso cross-tenant.
5. Permite a configuração elevar LLM/agente/prompt ou contornar enforcement.
6. Deixa a configuração indefinida/não-auditável/sem proveniência.
7. Resolve conflito configuração×princípio a favor da configuração.
8. Introduz código/API/schema/YAML/JSON/contrato machine-readable; ou reposiciona o YZI OS.

---

## 12. Relação com as camadas do YZI OS

A configuração de tenant opera entre a camada **Tenant** e a de **Policies/Specifications**: parametriza
o tenant **sob** a Authority das specifications e **sobre** o Estado como verdade, preservando o
isolamento de [`tenant-boundary`](../p0/tenant-boundary.spec.md) e
[`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md). O `tenant-harness` a administra; o
`governance-harness` garante que ela não contorne enforcement; conflitos resolvem-se por
[`conflict-resolution`](../p0/conflict-resolution.spec.md). Herda autoridade de
[`layer-authority-model`](../p0/layer-authority-model.spec.md).

---

## 13. Relação com specifications futuras

Abre o grupo Multi-Tenant: antecede `tenant-policy-pack` (policies por tenant — eixo §8.3) e
`tenant-retrieval-scope` (escopo de retrieval por tenant — eixo §8.4) — ver
[Specification Map](../../specification-engineering/specification-map.md). É a base do `tenant-harness`.
**Não autoriza** a criação dessas specs futuras.

---

## 14. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Relação com a configuração de tenant |
| --- | --- |
| **Skill** | opera dentro da configuração do tenant; não a redefine |
| **Subagente** | herda o escopo configurado; não amplia a verticalização |
| **Harness** | o `tenant-harness` administra a configuração; o `governance-harness` a fiscaliza |
| **Service** | aplica a configuração dentro de contrato; não cria exceção |
| **Tool** | só os tools **autorizados** para o tenant executam (eixo §8.5) |
| **LLM / agente de código** | não define nem altera configuração; configuração não é decidida em linguagem |

---

## 15. Método de verificação

1. **Subordinação:** verificar que nenhuma configuração se sobrepõe a princípio/fronteira/policy/estado.
2. **Eixos:** verificar que a verticalização ocorre apenas pelos cinco eixos governados (§8).
3. **Não-ruptura:** verificar ausência de fork/exceção fora de contrato/bypass.
4. **Isolamento:** verificar que nenhuma configuração concede acesso cross-tenant.
5. **Auditabilidade:** verificar que a configuração é declarada, proveniente e versionável.
6. Violação ⇒ rejeição/escalada; verificação independente do agente e reconstruível.

---

## 16. Observabilidade esperada

- Registro, por tenant: configuração vigente · eixos parametrizados · autoridade que a definiu ·
  momento · versão.
- Registro de tentativas de configuração rejeitadas (ruptura, cross-tenant, elevação de autoridade,
  bypass).
- Trilha auditável e read-only da configuração ao longo do tempo (`P9`, `DO6`).

---

## 17. Riscos arquiteturais evitados

- **Customização livre** — cliente reescrevendo a arquitetura via "configuração".
- **Verticalização por fork** — bifurcação insegura multiplicando risco (`tenant-boundary`).
- **Configuração acima do princípio** — parâmetro suspendendo lei core.
- **Vazamento por configuração** — parâmetro concedendo acesso cross-tenant.
- **Bypass via configuração** — parâmetro contornando enforcement ou elevando o LLM/agente.

---

## 18. Fora de escopo

- **Não** define as **policies por tenant** (`tenant-policy-pack`) nem o **escopo de retrieval por
  tenant** (`tenant-retrieval-scope`) — apenas os prepara como eixos (§8) e os referencia.
- **Não** cria o `tenant-harness` executável nem nenhuma outra spec.
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  sprint plan, YAML/JSON, contrato machine-readable ou implementation harness.

---

## 19. Proveniência

`[HE-GOV]` Harness Engineering / Governança — configuração sob enforcement; verticalização governada;
evidência auditável. `[PYR]` Context→Intent→Specification — configuração parametriza **sob** a
constituição; não reescreve a lei. `[AHE]` Agentic Harness Engineering — multi-tenancy por configuração,
não por bifurcação; isolamento preservado por construção.

---

## 20. Fronteiras (o que NÃO está aqui)

- **Não** substitui o isolamento multi-tenant nem os princípios core: é a spec que os **opera** como
  contrato de configuração de tenant verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura nem as demais specs Multi-Tenant — apenas fixa a configuração de
  tenant que elas herdam.
