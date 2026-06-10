# YZI OS — Audit Harness

> Camada `harness-engineering`. Detalha o harness de auditoria — proveniência, atribuição,
> entropia e independência do auditor. Deriva da [filosofia de harness](harness-philosophy.md) e
> da [arquitetura de observabilidade](../architecture/observability-architecture.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[CE]` `[HARNESS-RT]` `[PYR]` `[AHE]`

---

## 1. Propósito

Detalha o **audit harness**: o substrato que torna toda ação auditável e atribuível. Sem
implementação.

## 2. Atribuição antes de recuperação

A atribuição **separa observação, comportamento esperado e diagnóstico** e ocorre **antes** de
qualquer nova ação corretiva — evitando remendos aleatórios. `[HARNESS-RT]` (`DO9`) Registra saída
observada, esperada, tipo de falha, evidência e alternativas. `[HARNESS-RT]`

## 3. Auditor independente

Quem executa **não** audita: a avaliação independente captura erros que a auto-revisão ignora. `[CE]`
O audit harness materializa essa separação.

## 4. Proveniência e responsabilidade transitiva

Mantém a rastreabilidade de cada fragmento e decisão à origem (`DO6`), com **responsabilidade
transitiva via atestação** em cadeias de delegação (assinaturas verificáveis elo a elo). `[PYR]`

## 5. Auditoria de entropia

Detecta e registra o ônus de manutenção introduzido por operações (resíduo, deriva,
enfraquecimento de verificação, violação de fronteira). `[HARNESS-RT]` (`DO10`) Trata entropia
**dentro** do laço.

## 6. Controlabilidade e trilha orgânica

Verificador/tracer/config são **read-only** para o executor (`[AHE]`); a trilha de auditoria
**forma-se organicamente** quando cada estágio preserva sua saída. `[CE]` (`P9`)

## 7. Fronteiras (o que NÃO está aqui)

- **Não** julga conformidade (governança) nem decide (services).
- **Não** define formatos de log, assinatura ou código.

## 8. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P9` ação auditável | §2, §4, §6 |
| `DO6` provenance tracking | §4 |
| `DO9` verificação como runtime | §2 |
| `DO10` auditoria de entropia | §5 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md) (auditabilidade
é a 4ª posição).
