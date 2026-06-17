# Skill Spec — Cockpit Skeleton UI Review (Lane 4) v1

> Spec documental apenas. Não é skill executável, não cria arquivo `.claude/`, não roda nada. Materialização exige task própria e gate humano.

## Quando Usar

Na revisão do Step 6 (cockpit skeleton), antes do Step 7 (lint/build).

## Inputs

- `cockpit/layout.tsx` e `cockpit/page.tsx` (diff ou leitura);
- Seção "NÃO entrega" do execution program;
- Parecer do tenant context (Step 5).

## Passos

1. Confirmar que só existem layout + página inicial — nenhuma rota extra de feature;
2. Confirmar que a página exibe somente: identidade do usuário logado e tenant atual **ou** estado vazio honesto;
3. Confirmar zero features de negócio (dashboard, CRUD, billing, métricas, automações);
4. Confirmar ausência de design system/refinamento visual além do esqueleto;
5. Confirmar que nenhum dado é buscado além do tenant context já revisado;
6. Registrar resultado textual.

## Outputs

- Parecer APROVADO/REPROVADO com checklist;
- Lista de qualquer elemento de UI excedente.

## Stop Conditions

- Feature de negócio detectada → `OUT_OF_SCOPE_WRITE`;
- Fetch novo fora do tenant context → parar e reportar;
- Tela mascarando erro como dado → `DISHONEST_EMPTY_STATE`.
