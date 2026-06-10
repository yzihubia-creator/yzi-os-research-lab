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

## O que ainda NÃO existe (intencionalmente)

Banco, schema, migrations, auth, tenant model, API real, Supabase, Docker,
workflows, integrações e deploy **não estão autorizados** nesta fase.
Cada um exigirá spec própria + aprovação humana (Spec-Driven Development).
