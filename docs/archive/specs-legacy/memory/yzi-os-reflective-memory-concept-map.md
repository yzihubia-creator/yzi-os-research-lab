# YZI OS Reflective Memory Concept Map

## 1. Objetivo

Mapear, em nível conceitual e documental, a camada `YZI OS Reflective Memory`, separando claramente quatro componentes: `Raw Event Memory`, `Reflective Memory`, `Retrieval Evidence Layer` e `Memory Governance`. Esta task não cria banco, embeddings, retriever, runtime, código nem execução técnica. Implementação técnica = 0%.

## 2. Fonte do Mapa Conceitual

- Boundary: `/docs/specs/memory/yzi-os-reflective-memory-architecture-boundary.md`.
- Referências conceituais: Titans/MIRAS (retenção seletiva, esquecimento, surpresa) e RMM (Prospective/Retrospective Reflection, memória por tópico, evidência/citação).
- Readiness de entrada: `TASK_248A_YZI_OS_REFLECTIVE_MEMORY_ARCHITECTURE_BOUNDARY_PATH_CORRECTED_DOCUMENTARY_ONLY`.

## 3. Visão Geral dos Quatro Componentes

1. `Raw Event Memory` — registro bruto de eventos, mensagens, tool results, handoffs, evidence records e mudanças de estado; não consolida nem decide importância.
2. `Reflective Memory` — consolidação de experiência em tópicos, resumos, preferências, decisões e padrões; inspirada em Prospective Reflection (RMM) e retenção seletiva (Titans/MIRAS).
3. `Retrieval Evidence Layer` — preserva a origem de cada informação usada (spec, KB, conversation, tool result, evidence record, lead state, project state); inspirada na memória com evidência/citação do RMM.
4. `Memory Governance` — decide, por política e autorização, o que pode ser lembrado, atualizado, esquecido, bloqueado, citado ou usado.

## 4. Tabela Conceitual dos Componentes

| Layer | What It Stores / Controls | What It Does Not Do | Status |
| ----- | ------------------------- | ------------------- | ------ |
| Raw Event Memory | eventos brutos, mensagens, tool results, handoffs, evidence records, mudanças de estado | não consolida, não decide importância, não julga relevância | CONCEPTUAL_LAYER_ONLY |
| Reflective Memory | tópicos, resumos, preferências, decisões, padrões consolidados | não cria embedding nem banco nesta fase; não executa | DEFER_TECHNICAL_IMPLEMENTATION |
| Retrieval Evidence Layer | origem/proveniência de cada informação usada | não implementa retriever, reranker nem RL | DEFER_TECHNICAL_IMPLEMENTATION |
| Memory Governance | política de lembrar/atualizar/esquecer/bloquear/citar/usar | não é automação; não substitui autorização humana | ARCHITECTURAL_PRINCIPLE_ONLY |
| qualquer execução técnica de memória | — | — | NOT_AUTHORIZED_FOR_EXECUTION |

## 5. Fluxo Conceitual Entre Componentes

`Raw Event Memory → Reflective Memory → Retrieval Evidence Layer → Memory Governance → Agent Response / Operational Decision`

No YZI OS, a governança pode **bloquear, revisar ou exigir evidência** antes de qualquer uso de memória; o fluxo é conceitual, não um pipeline executável.

## 6. Relação com RAG

- RAG recupera conhecimento/documentos;
- Reflective Memory organiza experiência acumulada;
- Retrieval Evidence Layer prova origem;
- Memory Governance decide uso;
- o YZI OS não deve tratar RAG e memória reflexiva como a mesma coisa.

## 7. Relação com Governança

A memória só é usada sob política e autorização: governança decide o que entra em Reflective Memory, o que é citado via Retrieval Evidence Layer, o que é esquecido/bloqueado e o que exige evidência ou autorização humana explícita antes do uso.

## 8. Relação com Produtos YZI OS (apenas conceitual)

- Ju / YZI IMOB: memória de lead, preferências, imóveis apresentados, handoff, follow-up;
- Café com Pam: memória de cliente, projeto, briefing, estilo, decisões e pendências;
- multi-tenant: separação de memória por tenant, agente, usuário, projeto e política;
- evidence records: trilha de prova para decisões e uso da memória.

Nada é implementado.

## 9. Usos Permitidos Nesta Fase

Definir camadas conceituais; mapear responsabilidades; diferenciar RAG de memória reflexiva; registrar fluxo conceitual; identificar riscos; preparar a próxima task documental.

## 10. Usos Proibidos Nesta Fase

Criar banco, tabelas, schema, embeddings, vector store, retriever, reranker, RL, runtime; alterar n8n, Supabase, frontend, Jurema ou Café com Pam; criar código, integração, automação ou execução técnica.

## 11. Próxima Task Recomendada

`Task 250 — Create YZI OS Reflective Memory Governance Boundary` — definir apenas o boundary documental de governança da memória reflexiva (lembrar, atualizar, esquecer, bloquear, citar e usar), sem implementação técnica; requer nova autorização humana explícita.

## 12. Readiness Statement Final

`TASK_249_YZI_OS_REFLECTIVE_MEMORY_CONCEPT_MAP_CREATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhum código, banco, tabelas, schema, embeddings, vector store, retriever, reranker, RL, runtime, loader, registry, runner, `.claude/`, hook, MCP ou integração criado ou alterado.
