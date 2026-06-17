# Pack 05 — Cockpit Skeleton UI v1

> Pack documental da Lane 4 — Cockpit Skeleton. Não executa nada agora. Corresponde aos Steps 6–8 do runbook. Gate requerido: L4-G4.

## Objetivo

Implementar (quando autorizado) o esqueleto navegável do cockpit: layout + página inicial exibindo o tenant do usuário autenticado **ou** estado vazio honesto — e validá-lo com lint/build e verificação visual contra banco limpo.

## Escopo Autorizado

- `platform/src/app/cockpit/layout.tsx`;
- `platform/src/app/cockpit/page.tsx`;
- Step 7: comandos `npm run lint` e `npm run build` (somente estes);
- Step 8: `npm run dev` executado pelo humano para verificação visual;
- Correções de lint/build restritas aos arquivos já tocados nos Packs 02–05.

## Escopo Proibido

- Dashboard real, CRUD, billing, métricas, automações, CRM;
- Design system ou refinamento visual além do esqueleto;
- Rotas além de `/login` e `/cockpit`;
- Fetch de dados além do tenant context do Pack 04.

## Entradas

- Gate L4-G4;
- Tenant context aprovado (Pack 04);
- Skill specs `cockpit-skeleton-ui-review-skill-v1` e `nextjs-16-platform-safety-skill-v1`;
- Subagent spec `cockpit-skeleton-reviewer-agent-spec-v1`.

## Saídas Esperadas

- Cockpit acessível com sessão; protegido sem sessão (conforme D6);
- Estado vazio honesto renderizado com banco limpo;
- `npm run lint` e `npm run build` passando, outputs registrados.

## Validação

- Parecer APROVADO conforme skill `cockpit-skeleton-ui-review-skill-v1`;
- Step 7 passou; Step 8 confirmado pelo humano (sem dado falso, sem crash, sem loop de redirect).

## Stop Conditions

- Feature de negócio detectada → `OUT_OF_SCOPE_WRITE`;
- Lint/build falhando de forma não trivial → `BUILD_FAILURE`;
- Dado inventado exibido → `DISHONEST_EMPTY_STATE`.

## Evidence Esperado

`evidence/templates/lane-4-cockpit-skeleton-evidence-template-v1.md` preenchido com outputs de lint/build e observação do estado vazio.
