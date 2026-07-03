# YZI IMOB — Multi-Tenant Boundary v0.1

Regras obrigatórias de isolamento entre tenants. Aplicam-se conceitualmente a toda tela, feature, integração e futuro storage do YZI IMOB. Nenhum dado pode atravessar tenant.

## Regra forte

`Sem tenant_id, não existe dado operacional confiável.`

## Regras obrigatórias

1. Todo dado pertence a um `tenant_id`.
2. Toda tela deve assumir um tenant ativo; nenhuma tela opera "sem tenant".
3. Nenhum dado global pode aparecer como dado real de cliente — dado de exemplo deve ser declarado como exemplo (estado honesto).
4. Tokens, conexões e credenciais são por tenant (`connection_id` sempre subordinado a `tenant_id`).
5. Imóveis pertencem a tenant (`property_id`).
6. Leads pertencem a tenant (`lead_id`).
7. Corretores pertencem a tenant (`broker_id`).
8. Assets/mídias pertencem a tenant (`asset_id`).
9. Documentos e comissões pertencem a tenant (`document_id`, `commission_id`).
10. Deals pertencem a tenant (`deal_id`).
11. Futuro storage deve usar `tenant_id` como boundary (paths, buckets e políticas segmentados por tenant).
12. Nenhuma execução com service role em frontend — acesso a dados sempre via RLS/RPCs seguras.
13. Nenhuma action real (envio, publicação, cobrança, conexão) sem aprovação humana.

## IDs operacionais

`tenant_id` · `property_id` · `lead_id` · `broker_id` · `deal_id` · `document_id` · `commission_id` · `asset_id` · `connection_id`

Todo ID operacional exceto `tenant_id` só tem significado dentro de um tenant. Cruzar IDs de tenants diferentes é violação de boundary.

## Checklist de revisão de boundary (por task)

- [ ] A tela/feature declara qual tenant boundary se aplica?
- [ ] Todo dado exibido pertence conceitualmente a um `tenant_id`?
- [ ] Há dado global disfarçado de dado de cliente?
- [ ] Tokens/conexões estão modelados por tenant?
- [ ] Há service role, credencial ou execução real no frontend?
- [ ] Há action real sem aprovação humana?

Qualquer resposta errada bloqueia a unidade até correção.
