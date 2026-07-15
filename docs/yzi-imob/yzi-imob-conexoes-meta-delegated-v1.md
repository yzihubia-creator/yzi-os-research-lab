# YZI IMOB — Meta Delegated Connection V1 (Spec)

Extensão do contrato `yzi-imob-conexoes-backend-contract-v1.md`. Unidade documental: nenhuma migration, rota, UI ou credencial. Estágio honesto: **planejada**.
Problema central: o gestor conecta as próprias contas Meta dentro do YZI IMOB por autorização oficial do provedor. Eric/YZI nunca pede, recebe, copia ou cadastra token por cliente.
Fluxo: Conectar → autorização oficial Meta (Facebook Login for Business) → callback server-side → descoberta de contas → seleção explícita de ativos → credencial no servidor fora do frontend → vínculo ao tenant → estado na tela Conexões.

## 1. Aplicativo Meta

- **App piloto "OCM Atendimento Oficial"**: apenas piloto, **condicionado à compatibilidade** com Facebook Login for Business e os escopos desta spec (verificação humana no painel — D1). Se incompatível, o piloto espera o app próprio.
- **App multi-tenant YZI/YZIHUB** (a criar): único app válido para produção multi-tenant; exige Business verification + App Review.
- Código **neutro por env**: `META_APP_ID`, `META_APP_SECRET`, `META_CONFIG_ID` (server-only, nunca `NEXT_PUBLIC_*`). Nenhuma string identifica a OCM; trocar de app = trocar env.
- Pendências externas (sempre separadas dos commits): app YZI, Business verification, App Review, redirect URI de produção.

## 2. Entidades

Catálogo estático inalterado. **Tenant Connection**: 1 conexão Meta ativa por tenant no V1. **Connection Assets**: ativos selecionados na autorização.

### 2.1 `tenant_connections` (revisão do contrato v1 §5.1)

`id` · `tenant_id NOT NULL FK` · `provider` (`meta`) · `catalog_id` · `status` (§7) · `granted_scopes text[]` (via `/me/permissions`) · `connected_by` (auth.uid() no servidor) · `connected_at` · `expires_at null` (metadado, nunca o token) · `last_checked_at` · `last_sync_at` · `last_failure_at` · `last_failure_reason` (sanitizada, nunca payload cru) · `revoked_at` · `provider_metadata jsonb` (sanitizado: nunca token/code/state) · `vault_secret_id uuid null` (**nunca exposto em RPC/view**) · `created_at/updated_at`.
Unique parcial `(tenant_id, provider)` em linhas não revogadas — idempotência: reconectar reaproveita a linha ativa, nunca duplica.

### 2.2 `tenant_connection_assets` (nova) e capacidades

`id` · `connection_id FK` · `kind` (`business|page|instagram|ad_account|waba` — waba reservado, fora do V1) · `external_account_id` · `account_label` (não sensível) · `metadata jsonb` sanitizado.
Unique global `(provider, kind, external_account_id)` entre conexões ativas: Page, Instagram e ad account têm **vínculo exclusivo ativo por tenant no V1**. Conflito → bloqueio do novo vínculo automático, mensagem honesta **sem revelar o tenant existente**. Futuro: **transferência governada** — exige revogação no tenant atual ou transferência administrativa, sempre com auditoria (`connection_revoked`/`connection_updated`).
`tenant_connection_capabilities` mantida como no contrato v1 §5.2; `unlocked` derivado de `granted_scopes` × assets (ex.: `publicar-conteudo` exige `pages_manage_posts` concedido E página selecionada).

### 2.3 `connection_authorizations` (state OAuth)

`id` · `tenant_id` · `user_id` · `provider` · `catalog_id` · `state_hash` (**somente hash SHA-256; state bruto nunca persistido**) · `created_at` · `expires_at` (= created_at + 10 min) · `consumed_at null` (uso único). Sem policy de leitura para o client.

### 2.4 `connection_audit_events` (nova)

Append-only: `tenant_id`, `connection_id null`, `event`, `actor_user_id null`, `metadata` sanitizado, `created_at`. Eventos: `authorization_started`, `authorization_completed`, `authorization_cancelled`, `assets_selected`, `connection_updated`, `connection_paused`, `connection_revoked`, `refresh_failed`. **Proibido** registrar token, code, state bruto ou payload cru.

## 3. Início da autorização

Rota `GET /api/connections/meta/start`. Tenant/usuário derivados só da sessão (`getTenantContext()`): exige `tenant_found`, membership `active`, `role ∈ {owner, admin}`; fora disso → `?erro=nao-autorizado`. **State**: aleatório de alta entropia (≥128 bits, CSPRNG); banco guarda só o hash; o valor bruto viaja apenas na URL da Meta — nunca em log, auditoria ou tabela. Proteções: CSRF (state vinculado a tenant+usuário), replay (uso único + 10 min), open redirect (retorno fixo interno `/cockpit/yzi-imob/conexoes`; um `next` eventual segue a regra do `auth/callback/route.ts`). Evento `authorization_started`.

## 4. Callback

Rota `GET /api/connections/meta/callback`, ordem estrita:

1. Valida sessão; `user_id` deve ser o mesmo do registro de autorização.
2. Hasheia o state e **consome atomicamente** (`UPDATE ... SET consumed_at=now() WHERE state_hash=$1 AND consumed_at IS NULL AND expires_at>now() RETURNING`). Inválido/expirado/reusado → `?erro=autorizacao-invalida`, nada persiste.
3. `error=access_denied` → evento `authorization_cancelled`, `?aviso=autorizacao-cancelada`.
4. Troca `code` → token **só no servidor**; troca imediata por long-lived.
5. Grava via operação de vault (§6); registra `expires_at`.
6. Upsert idempotente de `tenant_connections` com `status=awaiting_account_selection`; evento `authorization_completed`.
7. Redirect `?selecionar=meta`.

Nenhum token em query, log, cookie legível, resposta serializável ou frontend. Erros do provedor sanitizados.

## 5. Escopos — privilégio mínimo

- **Conjunto base (primeira autorização, V1)** — leitura/vínculo: `business_management`, `pages_show_list`, `pages_read_engagement`, `instagram_basic`, `ads_read`.
- **Publicação/gestão (futuro, incremental)**: `pages_manage_posts`, `instagram_content_publish` — pedidos **só quando a capacidade for ativada**, por reautorização incremental (config_id próprio). **`ads_management` fica fora da primeira autorização.**
- Concessão parcial do conjunto base → `insufficient_permissions`, capacidades bloqueadas honestamente.

## 6. Segredos

- Supabase Vault (`vault.secrets`), um segredo por conexão, referenciado por `vault_secret_id`.
- **Nenhuma RPC ou função genérica devolve token à aplicação**; não existe `get_secret` exposto. Operações **server-only estreitas** (`security_definer`, `search_path` fixo, verificação interna de owner/admin do tenant dono):
  - `connection_secret_store(connection_id, secret)` — retorna void/id;
  - leitura V1: **exclusivamente por módulo server-only autorizado** (guard `server-only`), dentro da execução backend, com invariantes: nunca acessível ao browser; nunca retornada por Server Action, RPC pública, prop, JSON, redirect, erro ou log; uso somente para chamada imediata ao provedor; descarte em memória após uso. Nenhuma função SQL genérica executa chamadas HTTP da Meta;
  - `connection_secret_delete(connection_id)` — remoção definitiva.
- Frontend nunca recebe credencial em nenhuma forma. Nenhum service role no app; nenhum SELECT direto em `vault.*`.

## 7. Estados canônicos (backend)

`not_connected` (ausência de linha) · `authorization_started` (vive em `connection_authorizations`) · `awaiting_account_selection` · `connected` · `insufficient_permissions` · `token_expiring` · `reconnect_required` · `revoked` · `provider_error` · `paused`.
Mapeamento UI em código (catálogo intocado, vocabulário nunca técnico): `awaiting_account_selection`/`insufficient_permissions`→`incompleto`; `token_expiring`/`reconnect_required`→`renovar`; `provider_error`→`falha`; `revoked`/ausência→`nao-conectado`; `paused`→`pausado`; `connected`→`conectado`.

## 8. Expiração e renovação

**Não assumir renovação automática.** V1 sem job agendado (fica **fora do MVP inicial**). A abertura da tela **lê apenas o último estado persistido** — nunca depende de chamada síncrona à Meta; falha da Meta nunca impede a renderização. Verificação externa somente: `last_checked_at` vencido; ação manual do gestor; uso real da conexão; após erro do provedor. Avaliação de `expires_at`: ≤10 dias → `token_expiring`; expirado/rejeitado em uso → `reconnect_required` + evento `refresh_failed`. Renovação programática **só quando suportada e comprovada para o tipo de token** (documentação Meta vigente na implementação); caso contrário, sempre reautorização pelo gestor (mesmo fluxo §3, preservando `catalog_id` e assets).

## 9. Leitura pelo frontend

RPC `get_yzi_imob_tenant_connections()` — `security_definer=false`, RLS-first, padrão agregador de `lib/yzi-imob/properties/repository.ts` (união discriminada, degrade gracioso). Retorna conexões+assets+capacidades do tenant; **nunca** `vault_secret_id`, token ou erro cru. Merge no frontend permanece o do contrato v1 §6 (catálogo base, dado real sobreposto por `catalog_id`).

## 10. Descoberta e seleção

- `discoverMetaAssets()` (Server Action, owner/admin): lista Businesses, Páginas, Instagram vinculado, contas de anúncios via §6; retorna **só metadados**.
- Account selector (componente novo, unidade futura): múltiplos Businesses → escolhe 1; 1 Página; 1 Instagram (pré-selecionado o vinculado); 0..1 conta de anúncios (**somente leitura, `ads_read`**).
- Persistência só após **confirmação explícita**: `confirmMetaSelection()` grava assets, deriva capacidades, `status=connected` (ou `insufficient_permissions`); evento `assets_selected`; idempotente (reconfirmar substitui).

## 11. Escopo da primeira entrega funcional

Inclui: Meta Business (portfólio), Página do Facebook, Instagram profissional, conta de anúncios **somente leitura**.
Fora do V1 (unidades futuras): WABA/WhatsApp e Embedded Signup (kind `waba` reservado); publicação; `ads_management`; multi-conexão por tenant; job agendado; outros provedores.

## 12. RLS e tenant boundary

SELECT (metadados) por membership ativa, qualquer papel. **Nenhuma policy de escrita para o client** — toda mutação passa pelo fluxo governado server-side (owner/admin, tenant da sessão). Owner/admin inicia, reconecta, pausa, remove; operator/viewer só lê estado. Nenhum tenant acessa conexão/segredo de outro; `connection_authorizations` e vault sem superfície de leitura para o client. Nota: atualizar o texto `cannotYet` de `lib/tenant/role-boundary.ts` em unidade separada quando o fluxo existir.

## 13. Ações do gestor

Conectar/Reconectar/Revisar autorização (fluxo §3–§4, preservando `catalog_id`/assets) · Pausar/Reativar (só `status`, credencial intocada) · Remover: confirmação explícita → `connection_secret_delete` + melhor esforço `DELETE /me/permissions` + `status=revoked`/`revoked_at`; nunca soft-delete de credencial.

## 14. Frontend posterior (contrato)

Reutilizar tela e componentes existentes (`StateChip`, `ConnectionRow`, `ConnectionDetail`, `actionForState`, workspace kit) — sem redesenho, sem card wall, sidebar intocada. Novos (3): `MetaAccountSelector`, `ConnectionCallbackFeedback` (lê `?erro/?aviso/?selecionar`), `ConfirmRevokeDialog`. UX pela skill impeccable quando autorizada.

## 15. Ordem de implementação (Codex)

1 Schema/RLS (§2, §12) — **gate: autorização SQL humana** · 2 Vault (§6) — **gate: autorização SQL humana** · 3 Início OAuth (§3) · 4 Callback (§4) · 5 Descoberta (§10) · 6 Selector+confirmação (§10) · 7 Leitura real na tela (§9) — gate: verificação visual humana · 8 Reconexão/pausa/revogação (§13) · 9 Testes integrados (§16). Cada unidade: staging explícito, lint/build, commit só com autorização humana; pendências externas separadas.

## 16. Testes obrigatórios

state inválido · state expirado · replay · sem membership · role sem autoridade · tenant divergente · cancelamento pelo gestor · permissão parcial · múltiplos portfólios · ativo já vinculado · token expirado · revogação externa detectada em uso · **nenhum segredo exposto** (asserções: nenhuma resposta serializável, log ou evento contém token/code/state bruto).

## 17. Dúvidas externas em aberto e fora de escopo

Dúvidas: D1 app OCM compatível com Facebook Login for Business + escopos base? · D2 Business verification YZI/YZIHUB existe? · D3 extensão `supabase_vault` habilitada? · D4 redirect URI de produção registrado no app Meta.
Fora de escopo: qualquer implementação; WABA/Embedded Signup; publicação e `ads_management`; job agendado; outros provedores; entrada na sidebar; nome de provedor de produção criativa na UI (freeze do Growth OS).
