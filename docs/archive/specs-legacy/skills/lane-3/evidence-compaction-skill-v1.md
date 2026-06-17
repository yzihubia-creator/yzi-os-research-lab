# Skill Spec — Evidence Compaction v1

## Status

`SPEC_ONLY_NO_SKILL_CREATED`

Esta é uma **especificação documental** de uma skill futura. Nenhuma skill executável foi criada. A criação da skill real exige task separada com gate humano explícito.

---

## Quando Usar

Ao preencher um evidence template após execução de um pack, para garantir que o evidence é: completo (todos os campos preenchidos), compacto (sem informação desnecessária), auditável (rastreável ao pack e gate humano), e seguro (sem secrets ou service role).

---

## Inputs

| Input | Tipo |
|-------|------|
| Template de evidence a preencher | Arquivo Markdown |
| Output reportado pelo humano (SQL ou build) | Texto colado no chat |
| Pack de referência executado | Arquivo Markdown |
| Gate humano confirmado | Declaração no chat |
| Status final determinado | Texto: PASSOU / FALHOU / DIFERIDO |

---

## Passos

1. Identificar o template correto para o pack executado;
2. Preencher o campo `Readiness Statement` com o código de status adequado;
3. Preencher `Contexto`: data, executor, método, evidence anterior;
4. Inserir o output reportado pelo humano nos campos correspondentes (sem editar o conteúdo);
5. Preencher a tabela de checks com resultado real de cada item;
6. Registrar stop events: `NONE` se nenhum, ou listar com código e descrição;
7. Verificar que nenhum secret, API key ou service role aparece no evidence;
8. Preencher `Próxima Ação` e `Final Status`;
9. Confirmar que o evidence é autocontido (pode ser lido sem contexto do chat).

---

## Outputs

| Output | Tipo |
|--------|------|
| Evidence template preenchido | Arquivo Markdown |
| Confirmação: evidence completo e seguro | Texto no chat |

---

## Stop Conditions

- Campo obrigatório do template não preenchível com informação disponível → solicitar ao humano antes de preencher;
- Secret ou service role detectado no output a ser inserido → `SECRET_EXPOSURE` → não inserir; solicitar ao humano que remova antes de reportar;
- Output reportado inconsistente com estado esperado pelo pack → registrar como `FAILED` e bloquear avanço;
- Evidence de pack anterior ausente quando exigido como pré-condição → bloquear e solicitar.
