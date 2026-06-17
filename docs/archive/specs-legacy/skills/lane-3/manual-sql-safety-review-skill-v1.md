# Skill Spec — Manual SQL Safety Review v1

## Status

`SPEC_ONLY_NO_SKILL_CREATED`

Esta é uma **especificação documental** de uma skill futura. Nenhuma skill executável foi criada. A criação da skill real exige task separada com gate humano explícito.

---

## Quando Usar

Antes de apresentar qualquer arquivo SQL ao humano para execução manual. Garantir que o SQL gerado não contém secrets, não usa service role, não dropa tabelas, é idempotente quando possível e está dentro do escopo autorizado pelo pack vigente.

---

## Inputs

| Input | Tipo |
|-------|------|
| Conteúdo do arquivo SQL a ser revisado | Texto |
| Pack de referência autorizado | Arquivo Markdown |
| Tipo de operação (DDL / DML / POLICY / QUERY) | Texto |

---

## Passos

1. Verificar se o SQL contém qualquer secret, API key ou connection string → bloquear se encontrar;
2. Verificar se o SQL menciona `service_role` ou `SERVICE_ROLE` → bloquear se encontrar;
3. Verificar se o SQL executa DROP TABLE, DROP SCHEMA ou TRUNCATE → bloquear se encontrar;
4. Verificar se o SQL executa INSERT em tabelas de produção sem flag de "teste opcional" → alertar;
5. Verificar idempotência: operações de criação usam `IF NOT EXISTS` ou equivalente → alertar se ausente;
6. Verificar que as tabelas referenciadas estão dentro do escopo autorizado pelo pack;
7. Verificar que policies usam `auth.uid()` e não hardcode de UUIDs;
8. Confirmar ausência de `CREATE ROLE`, `GRANT`, `REVOKE` não autorizados.

---

## Outputs

| Output | Tipo |
|--------|------|
| Resultado: APROVADO / BLOQUEADO | Texto |
| Lista de itens verificados com resultado | Tabela |
| Justificativa de bloqueio (se houver) | Texto |

---

## Stop Conditions

- Secret encontrado → `SECRET_EXPOSURE` → bloquear e não apresentar o SQL ao humano;
- Service role encontrado → `SECRET_EXPOSURE` → bloquear imediatamente;
- DROP TABLE ou TRUNCATE não autorizado → `DESTRUCTIVE_OPERATION` → bloquear;
- SQL fora do escopo do pack → `OUT_OF_SCOPE_SQL` → bloquear.
