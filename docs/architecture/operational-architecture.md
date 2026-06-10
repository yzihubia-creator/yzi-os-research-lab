# YZI OS — Arquitetura Operacional

> Documento de arquitetura (espinha dorsal). Define **como uma operação institucional
> acontece** no YZI OS: quem decide, quem executa, como se governa e como se comprova.
> Detalha o fluxo conceitual da [arquitetura conceitual](conceptual-architecture.md).
>
> Camada: `architecture` · Status: canônico · Versão: v1
> Proveniência: `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]`

---

## 1. Propósito e escopo

A arquitetura conceitual diz **o que** o sistema é. Esta arquitetura diz **como ele opera**: a
semântica de uma operação institucional do pedido à evidência. Define os papéis operacionais
(operador, agente, services, tools, governança, observabilidade) em ação.

Não há implementação aqui. A operação é descrita como **modelo**, não como código.

---

## 2. A unidade de operação: o episódio

A unidade de avaliação do YZI OS não é a resposta do modelo — é o **episódio**: uma tentativa
do sistema `modelo–harness–ambiente` de completar uma operação especificada. `[HARNESS-RT]`

Um episódio é definido por: identidade do tenant, identidade do agente/operador, a
specification aplicável, o pacote de contexto visível, as tools permitidas, a política de
intervenção, o procedimento de verificação e a regra de resultado. Cada episódio produz um
**pacote de episódio**: o registro auditável contendo traces, resultado, relatório de
verificação, atribuição de falha e auditoria de entropia. `[HARNESS-RT]` (`P9`)

> A operação não termina quando o modelo "responde". Termina quando o episódio produz
> evidência verificada e auditável de que o requisito foi satisfeito.

---

## 3. Os papéis operacionais

### 3.1 Operador

A figura central da operação é o **operador**: quem define o objetivo, configura o agente e
**responde pelo resultado**. `[PYR]` A responsabilidade pelas ações recai sobre a instituição,
não sobre uma "IA" abstrata. A arquitetura operacional existe para tornar essa
responsabilidade **exercível** — o operador governa o que pede, governa o que o agente faz, e
prova depois o que foi feito.

### 3.2 Agente — propõe (linguagem)

O agente recebe a intenção e a traduz em **operação proposta**. Ele não decide nem executa: é
a interface linguística institucional. `[CE]` (`P7` `P18`) Sua proposta entra no pacote de
contexto no papel de **Metadata** — o de menor autoridade. `[CE]`

### 3.3 Services — decidem (lógica institucional)

Os **services** contêm a lógica institucional, as regras e as validações. São eles que
**decidem** a operação, dentro do contrato de specification aplicável. `[PYR]` (`P2`) A decisão
é uma propriedade do backend, nunca da inferência.

### 3.4 Tools — executam (controladas)

As **tools** são a execução operacional controlada: as conexões com sistemas externos. Elas
agem apenas sob **fronteira de permissão explícita** e produzem trace de cada invocação. `[HARNESS-RT]`
(`P14`) O modelo apenas descreve a invocação; a tool a realiza. `[PYR]`

### 3.5 Governança — restringe (determinística)

A governança (RAG/XML/Policies) **restringe** o espaço de ação antes da decisão e o **verifica**
depois. É enforcement determinístico, não guidance probabilístico. `[HE-GOV]` (`P5` `P12`)

### 3.6 Observabilidade — comprova (auditoria)

A observabilidade **comprova**: registra proveniência, atribuição de falha e verificação,
fechando cada episódio como objeto auditável. `[HARNESS-RT]` (`P8` `P9`)

---

## 4. O ciclo operacional governado

Toda operação percorre um ciclo com governança nas duas pontas (pré e pós-execução):

```
intenção → [montagem de contexto] → [enforcement pré] → decisão(services)
        → execução(tools) → persistência(state) → [verificação] → [auditoria] → episódio fechado
```

> **Isto é um ciclo governado, não um workflow fixo nem um pipeline rígido.** A sequência
> acima descreve a *ordem de governança*, não um script imutável. O que a operação faz a
> cada passo é determinado dinamicamente por **estado, contexto, policies, specifications,
> tools e observabilidade** — não por um fluxo pré-codificado. O ciclo admite iteração e
> retrocesso: a verificação (passo 6) pode re-acionar a atribuição e a correção
> (reproduzir → atribuir → corrigir → verificar → reportar, §5), e o enforcement pode
> interromper ou redirecionar a operação a qualquer ponto. Nenhum caminho é garantido por
> ser "o próximo da fila"; cada transição é uma decisão governada.

1. **Montagem de contexto.** O runtime monta o pacote de contexto a partir do estado e do
   retrieval governado, respeitando isolamento de tenant e os critérios de qualidade
   (relevância, suficiência, isolamento, economia, proveniência). `[PYR]` (`P11`)
2. **Enforcement pré-decisão.** As policies e a specification aplicável restringem o espaço de
   ação. Operação fora de contrato não prossegue. `[HE-GOV]` (`DO4` `DO5`)
3. **Decisão.** Os services decidem, com base no contexto e nas regras institucionais. (`P2`)
4. **Execução.** As tools executam sob permissão explícita; cada chamada é traçada. (`P14`)
5. **Persistência.** O resultado é registrado no estado como **evento auditável** — o estado
   evolui por eventos, não por mutação implícita. (`DO8`)
6. **Verificação.** A conclusão é vinculada a evidência determinística (ver §5).
7. **Auditoria.** Proveniência, verificação e entropia compõem o pacote de episódio. (`P9` `DO10`)

A governança aparece **duas vezes** (passos 2 e 6) porque guidance pré-geração não garante
conformidade; só o enforcement pós-geração a comprova. `[HE-GOV]`

---

## 5. Verificação como capacidade operacional

No YZI OS, **verificação é uma responsabilidade do sistema, não do humano**. `[HARNESS-RT]`
(`DO9`) A conclusão de uma operação não é uma asserção ("está pronto") — é um **objeto
evidenciário**: requisitos mapeados a verificações determinísticas, comportamento preservado
checado, evidência e limitações reportadas.

A disciplina canônica de verificação é: `[HARNESS-RT]`

> **reproduzir → atribuir → corrigir → verificar → reportar**

com **atribuição de falha antes de qualquer nova ação corretiva** — separando diagnóstico de
ação para evitar correções aleatórias. `[HARNESS-RT]` Complementa este modelo o princípio do
**auditor independente**: quem executa não pode ser quem audita, pois a avaliação independente
captura erros que a auto-revisão sistematicamente ignora. `[CE]`

O resultado de um episódio é classificado de forma que **separe comportamento da operação de
qualidade da evidência**: uma operação pode estar correta porém não verificada, e uma operação
falha pode ser diagnosticamente útil. `[HARNESS-RT]`

---

## 6. Delegação operacional

Quando uma operação envolve sub-agentes ou sub-operações, vale a distinção entre **decompor** e
**delegar**: decompor parte a tarefa; **delegar transfere autoridade, responsabilidade e
confiança**. `[PYR]` Sem essa distinção, a operação multi-agente degenera num monólito
distribuído com ilusão de independência. `[PYR]`

Na delegação, vale a **atenuação de privilégio**: um agente transfere apenas a fatia
estritamente necessária de seus direitos, e cada elo da cadeia estreita as permissões. `[PYR]`
(`P10` `DO2`) A delegação obedece, ainda, à decomposição **contract-first**: só se delega o que
possui método de verificação precisamente definido. `[PYR]`

---

## 7. Entropia operacional

Operações autônomas não produzem apenas resultados — produzem **resíduo**: estado obsoleto,
deriva, enfraquecimento de verificação, violação de fronteira. A arquitetura operacional coloca
esse ônus **dentro do ciclo**, via auditoria de entropia, em vez de tratá-lo como externo. `[HARNESS-RT]`
(`DO10`) À medida que a instituição delega mais operação contínua, a gestão de entropia torna-se
tão importante quanto a operação imediata. `[HARNESS-RT]`

---

## 8. Intervenção humana como sinal

Quando um humano precisa intervir numa operação, isso **não é ruído** — é um **sinal
diagnóstico** de uma responsabilidade de governança ausente. `[HARNESS-RT]` Se o humano precisa
indicar qual contexto usar, há um déficit de montagem de contexto; se precisa interpretar uma
falha, há déficit de observabilidade ou atribuição. A arquitetura registra a intervenção e a
fronteira de governança a que ela corresponde, de modo que cada intervenção evitável aponte
para uma lacuna a fechar. `[HARNESS-RT]`

---

## 9. Fronteiras desta camada (o que NÃO está aqui)

- **Não** descreve o mecanismo de coordenação (montagem, roteamento, orquestração) — isso é da
  [arquitetura de runtime](runtime-architecture.md).
- **Não** descreve o modelo de persistência e continuidade — isso é da [arquitetura de
  estado](state-architecture.md).
- **Não** define contratos concretos — isso é da camada `specification-engineering`.
- **Não** contém código, API, schema, microservice nem backlog de implementação.

---

## 10. Conformidade com os princípios da fundação

| Princípio | Como esta arquitetura o instancia |
| --- | --- |
| `P2` backend decide | Services decidem (§3.3, §4 passo 3) |
| `P8` observabilidade obrigatória | Comprovação (§3.6); verificação como runtime (§5) |
| `P9` ação auditável | Episódio e pacote de episódio (§2); auditoria (§4 passo 7) |
| `P12` governança separada da linguagem | Enforcement duplo (§4); §3.5 |
| `P14` services/tools executam | Papéis operacionais (§3.3–3.4) |
| `P16` harnesses orquestram cognição | Ciclo governado e verificação (§4–5) |
| `DO9` verificação como runtime | Disciplina reproduzir→…→reportar (§5) |
| `DO10` auditoria de entropia | §7 |

A resolução de conflitos entre princípios segue a **ordem de valores** de
[`principles.md`](../foundation/principles.md).
