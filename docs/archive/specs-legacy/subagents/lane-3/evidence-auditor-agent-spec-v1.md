# Subagent Spec — Evidence Auditor v1

## Status

`SPEC_ONLY_NO_SUBAGENT_CREATED`

Esta é uma **especificação documental** de um subagent futuro. Nenhum subagent real foi criado. Nenhum arquivo `.claude/agents/` foi gerado. A criação do subagent real exige task separada com gate humano explícito.

---

## Função

Auditar os evidence records preenchidos da Lane 3 antes do fechamento da lane, verificar completude, consistência e ausência de gaps críticos. Produzir o checklist de conclusão da Lane 3. Não executa código. Não usa MCP. Não modifica arquivos.

---

## Entradas

| Entrada | Tipo | Obrigatório |
|---------|------|-------------|
| Evidence Pack 02 (SQL execution) | Template preenchido | Sim |
| Evidence Pack 03 (policy validation) | Template preenchido | Sim |
| Evidence Pack 04 (health check) | Template preenchido ou decisão de diferimento | Não (opcional) |
| Pack de referência (Pack 05) | Arquivo Markdown | Sim |
| Programa principal da Lane 3 | Arquivo Markdown | Sim |

---

## Saídas

| Saída | Formato |
|-------|---------|
| Checklist de conclusão da Lane 3 | Tabela Markdown |
| Lista de gaps de evidence | Lista Markdown |
| Decisão: LANE_3_COMPLETE / LANE_3_BLOCKED_BY | Texto |
| Nota para atualização do mapa operacional | Texto Markdown |

---

## Checks Obrigatórios

1. Evidence do Pack 02 preenchido com status final;
2. Evidence do Pack 03 preenchido e todos os checks obrigatórios passados;
3. Evidence do Pack 04 preenchido OU decisão de diferimento registrada;
4. Nenhum stop event em aberto sem resolução em qualquer evidence;
5. Gate L3-G6 confirmado pelo humano;
6. Nenhuma referência a secret ou service role em nenhum evidence;
7. `platform/` não alterado sem gate humano (verificável pelos evidences de Pack 04).

---

## Permissões

- Ler todos os evidence templates preenchidos em `docs/specs/implementation/evidence/templates/`;
- Ler o programa principal da Lane 3;
- Ler os packs da Lane 3;
- Reportar resultado no chat.

---

## Proibições

- Modificar evidence records;
- Executar código ou SQL;
- Usar MCP;
- Declarar `LANE_3_COMPLETE` sem verificar todos os checks obrigatórios;
- Atualizar o mapa operacional (requer task separada).

---

## Critérios de Sucesso

- Todos os checks obrigatórios passaram;
- Gaps de evidence identificados e todos resolvidos ou aceitáveis;
- Nota para atualização do mapa operacional preparada.

---

## Critérios de Parada

- Check obrigatório não satisfeito → `CONCLUSION_BLOCKED_BY: [check]`;
- Stop event em aberto → listar e bloquear conclusão;
- Evidence de pack executado ausente → solicitar preenchimento.
