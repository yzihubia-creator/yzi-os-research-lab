# /yzi-imob-validate-tenant-boundary

## Objetivo
Validar se uma task/unidade do YZI IMOB respeita o boundary multi-tenant. Regra forte: `Sem tenant_id, não existe dado operacional confiável.`

## Quando usar
Antes de implementar e antes de fechar qualquer unidade que envolva dados, telas ou integrações.

## Entradas esperadas
- `docs/yzi-imob/execution-pack/yzi-imob-multitenant-boundary-v0.1.md`
- Descrição da tela/feature, dados exibidos e integrações previstas.

## Procedimento
1. Ler o documento de boundary.
2. Verificar que todo dado pertence conceitualmente a um `tenant_id`.
3. Verificar que a tela assume um tenant ativo.
4. Verificar tokens/conexões/credenciais modelados por tenant.
5. Procurar violações bloqueantes (lista abaixo).
6. Emitir parecer aprovado/bloqueado com checklist preenchido.

## Bloquear sempre
- Dado sem `tenant_id`.
- Dado global disfarçado de dado de cliente.
- Service role no frontend.
- Credencial exposta.
- Action real sem aprovação humana.
- Vazamento entre tenants (IDs cruzados).

## Saídas esperadas
Parecer aprovado/bloqueado com o checklist de boundary preenchido e violações apontadas.

## Proibições
- Não aprovar exceções ao boundary.
- Não corrigir código por conta própria (apenas apontar).

## Checklist final
- [ ] Boundary lido.
- [ ] Todos os dados com tenant conceitual.
- [ ] Nenhuma violação bloqueante encontrada.
- [ ] Parecer emitido.
