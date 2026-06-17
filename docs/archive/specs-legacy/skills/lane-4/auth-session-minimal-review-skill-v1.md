# Skill Spec — Auth Session Minimal Review (Lane 4) v1

> Spec documental apenas. Não é skill executável, não cria arquivo `.claude/`, não roda nada. Materialização exige task própria e gate humano.

## Quando Usar

Na revisão do Step 4 (sessão/auth mínima), antes de declarar o step concluído.

## Inputs

- Diff de `session.ts`, `login/page.tsx`, `src/proxy.ts` (D6 aprovada em L4-G0);
- Decisões D3 e D6 registradas;
- Output de `npm audit` (se `@supabase/ssr` instalada).

## Passos

1. Confirmar escopo: somente login + sessão — sem signup, recovery, onboarding, perfis ou roles;
2. Confirmar ausência de service role e secrets hardcoded;
3. Confirmar persistência de sessão (reload mantém usuário logado);
4. Confirmar comportamento de `/cockpit` sem sessão coerente com D6 (redirect/bloqueio ou diferido);
5. Confirmar que erro de credencial inválida é tratado honestamente (mensagem, não crash);
6. Registrar resultado textual.

## Outputs

- Parecer APROVADO/REPROVADO com checklist;
- Violações de escopo listadas.

## Stop Conditions

- Qualquer feature de auth além do mínimo → `SCOPE_AMBIGUITY`, parar;
- Secret em código ou log → `SECRET_EXPOSURE`;
- `npm audit` com vulnerabilidade nova não reportada → parar e reportar.
