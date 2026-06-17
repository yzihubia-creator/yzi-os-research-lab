# Reflective Memory MVP Prototype Phase Start

## Readiness Statement

`TASK_260_REFLECTIVE_MEMORY_MVP_PROTOTYPE_PHASE_STARTED_CONTROLLED_IMPLEMENTATION_PREP_ONLY`

## Prototype Rule

`The prototype must validate the smallest possible Reflective Memory loop without affecting production, tenants, workflows, runtime, Jurema, or Café com Pam.`

## Smallest Testable Loop

`manual candidate memory → manual evidence attachment → tenant/project label → human review flag → stored prototype record → manual retrieval/readback → validation note`

Este loop é manual e isolado; não é runtime, não é workflow e não é state machine implementada.

## Authorized Prototype Boundary

Permitido apenas preparar implementação isolada (ambiente de teste local, sem impacto em produção).

Não permitido ainda:

* produção;
* Jurema;
* Café com Pam;
* n8n;
* Supabase real de produção;
* runtime;
* workflow automático;
* embeddings;
* vector store;
* retriever automático.

## First Implementation Candidate

Propor a menor implementação isolada possível, preferencialmente:

* arquivo markdown ou JSON local de teste;
* sem banco;
* sem migration;
* sem runtime;
* sem integração;
* sem automação.

A implementação efetiva deste candidato não é executada nesta task; depende de nova autorização (Task 261).

## Validation Criteria

O protótipo só passa se demonstrar:

* memória candidata registrada;
* evidência anexada;
* tenant/project explícito;
* autorização humana marcada;
* readback manual possível;
* memória bloqueada se evidência ausente;
* nenhum impacto em produção.

## Rollback

Rollback deve ser:

* apagar arquivo local de protótipo;
* não depender de banco;
* não depender de serviço;
* não afetar nenhum tenant real.

## Next Practical Task

`Task 261 — Create Local Reflective Memory Prototype File`

Não executar sem nova autorização humana explícita.

## Final Status

`TASK_260_COMPLETE_PROTOTYPE_PHASE_STARTED_PREP_ONLY`
