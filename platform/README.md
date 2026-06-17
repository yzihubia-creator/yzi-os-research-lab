# YZI OS Platform

Scaffold mínimo da plataforma YZI OS, criado conforme a spec aprovada
[`docs/specs/implementation/yzi-os-platform-scaffold-spec-v1.md`](../docs/specs/implementation/yzi-os-platform-scaffold-spec-v1.md).

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- ESLint

## Como rodar

```bash
cd platform
npm install      # apenas na primeira vez
npm run dev      # http://localhost:3000
```

Outros comandos:

```bash
npm run lint     # verificação estática
npm run build    # build de produção
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha conforme necessário.
Nenhuma variável é obrigatória nesta fase.

## Supabase

Fundação de client em `src/lib/supabase/`:

- `client.ts` é o client público do browser.
- `server.ts` é cookie-bound no Next Server Components / Server Actions.
- `health.ts` faz apenas um probe seguro de conectividade/auth.

O app usa apenas `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
no código. **Service role é proibida no app.** A sessão é preservada por
cookies do Next, e o acesso continua sujeito a RLS no backend. SQL segue
manual e autorizado apenas fora do frontend.

## O que ainda NÃO existe (intencionalmente)

Banco via código, schema, migrations, API real, Docker, workflows, integrações
e deploy **não estão autorizados** nesta fase.
Cada um exigirá spec própria + aprovação humana (Spec-Driven Development).
