# Skill Spec — Evidence Compaction (Lane 4) v1

> Spec documental apenas. Não é skill executável, não cria arquivo `.claude/`, não roda nada. Materialização exige task própria e gate humano.

## Quando Usar

Ao preencher qualquer evidence da Lane 4 (Steps 3–9), para manter evidences curtos, objetivos e auditáveis.

## Inputs

- Template `lane-4-*-evidence-template-v1` correspondente;
- Outputs reais reportados (lint, build, audit, observações do humano);
- Step e gate vigentes.

## Passos

1. Usar o template correspondente sem inventar seções novas;
2. Colar somente o trecho de output que prova o critério (não logs inteiros);
3. Marcar todo checklist com PASSOU/FALHOU — nunca deixar `[PREENCHER]` em evidence final;
4. Registrar stop events como `NONE` ou lista explícita;
5. Garantir que nenhum secret, token ou key apareça em output colado;
6. Encerrar com readiness statement e final status coerentes.

## Outputs

- Evidence preenchido, curto e auditável;
- Lista de gaps se algum output estiver faltando.

## Stop Conditions

- Output ausente para um claim de sucesso → não declarar sucesso, registrar gap;
- Secret detectado em output → `SECRET_EXPOSURE`, remover e reportar;
- Evidence final com campo `[PREENCHER]` restante → bloquear fechamento.
