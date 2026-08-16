# YZI IMOB — Plano de implementação Canva MCP v3

> Correção incremental da v2 (`yzi-imob-canva-connect-implementation-plan-v2.md`), auditada em 2026-08-16 contra o código real e a documentação oficial do Canva (`canva.dev/docs/mcp`, `/mcp/troubleshooting`, `/mcp/tools`, `/mcp/verify-integration`, metadata pública de `mcp.canva.com`). O host oficial de produção é `yzios.com.br`; `yzi-os.vercel.app` é apenas host legado/fallback e não é autoridade atual do callback. Planeja; não autoriza migration, alteração remota, OAuth real ou push. Documento atualizado sob autorização humana explícita de Eric (2026-08-16) para o Commit 1.

## 1. Decisão arquitetural

- **Canva MCP é a rota principal.** Endpoint único: `https://mcp.canva.com/mcp`.
- **Canva Connect APIs saem da rota principal** — o código existente fica dormente e desroteado.
- **Apps SDK fora do escopo.**
- Canva é infraestrutura; produto e editorial continuam no YZI IMOB, sem editor embutido.

A v2 está correta em quase tudo que é interno e errada na fronteira externa. A v3 corrige só a fronteira.

## 2. Contrato externo oficial

**Confirmed.** Endpoint MCP `https://mcp.canva.com/mcp`. Discovery em `https://mcp.canva.com/.well-known/oauth-authorization-server`: `issuer=https://mcp.canva.com`, `authorization_endpoint=/authorize`, `token_endpoint=/token`, `registration_endpoint=/register`, `revocation_endpoint=/token`, `code_challenge_methods_supported=["plain","S256"]`, `client_id_metadata_document_supported=true`; **sem `scopes_supported`**. CIMD é o método recomendado — o `client_id` é uma URL HTTPS que aponta para um JSON descrevendo o cliente, sem pré-registro e sem client secret. DCR está **deprecado em favor de CIMD**, mas segue disponível por compatibilidade. Registro manual documentado: `POST https://mcp.canva.com/register` com `client_name`, `redirect_uris`, `grant_types:["authorization_code"]`, devolvendo client id e secret. OAuth é por usuário: cada usuário autentica individualmente e só alcança o que já alcança no Canva. Allowlist: *"To add your redirect URI to the Canva MCP `allowlist`, apply for access with our Waitlist form"*; Claude, ChatGPT, Codex e Gemini já têm acesso; a revisão avalia marca, trust & safety, compliance, fit técnico e alinhamento estratégico, e devolve status de elegibilidade por e-mail. A verificação oficial de integração começa por conectar e listar tools. O cliente precisa aceitar respostas de `canva.com` e `canva.ai`.

Tools e limites (`docs/mcp/tools`) — **todos os planos:** `search-designs`, `get-design`, `get-design-pages`, `get-design-content`, `get-export-formats`, `get-assets`, `list-folder-items`, `search-folders`, `move-item-to-folder` e comentários (100 rpm); `generate-design`, `create-design-from-candidate`, `copy-design`, `import-design-from-url`, `create-folder`, `export-design` e transações de edição `start/commit/cancel` (20 rpm); `perform-editing-operations` (50 rpm); `upload-asset-from-url` (30 rpm). **Pro e acima:** `resize-design` (20), `search-brand-templates` e `list-brand-kits` (100), `create-design-from-brand-template` (20). **Enterprise:** `autofill-design` (60), `get-brand-template-dataset` (100).

**Conditional.** Granularidade da allowlist: a mensagem real fala em **host**, a documentação fala em **redirect URI** — informe a URI completa e assuma liberação por host. A documentação **não** diz que CIMD dispensa a allowlist: trate-a como obrigatória em qualquer método de registro. Brand templates/kits: a página de overview cita Enterprise, a tabela por tool cita Pro e acima — a tabela por tool é a autoridade operacional. Restringir redirect a domínio sob controle direto e remover `localhost`/`127.0.0.1` está documentado para Connect, não para MCP: boa prática, não requisito comprovado.

**Unknown / not documented.** **Scopes MCP** — não há `scopes_supported` publicado nem lista oficial para `/authorize`; os oito scopes hoje no `CanvaMcpAdapter` são scopes **Connect** e não estão validados para MCP. O `resource=https://mcp.canva.com/mcp` que o broker envia (RFC 8707) não é documentado nem desmentido pelo Canva. Número de URIs por cliente, SLA do formulário e contrato de revogação (`revocation_endpoint` aponta para o próprio `/token`) permanecem abertos. Nada disso vira contrato sem resposta real.

## 3. Auditoria de impacto v2 → v3

**KEEP (12)** — válidos independentemente do protocolo externo, verificados no código: `McpConnectionKind` com `canva` (`mcp/types.ts`); migration `20260815035008` (constraint + `endpoint_key = connection_kind`); `MCP_ENDPOINT_CATALOG.canva`, que **nunca** foi convertido para Connect e já aponta para `mcp.canva.com/mcp`; rota `api/yzi-imob/connections/canva/callback`, agnóstica de protocolo; `startCanvaMcpAuthorizationAction`; entrada `canva` em `connections/catalog.ts`; `public-registry.ts`; runtime genérico (state de uso único, PKCE, attempts, Vault, tenant binding, eventos, `discover`/`health`/`refresh`); `readCanvaMcpCallbackUrl` + `allowedCallbackOrigins`; domínio creative com `CarouselRenderTransport`/`ExternalCreativeTransport`; separação `yzi-imob-source-media` vs. `yzi-imob-private`/`public`; os dois testes MCP de endpoint e de migration.

**REVERT (9)** — deixam de ser autoridade: `CANVA_CONNECT_CLIENT_ID`; `CANVA_CONNECT_CLIENT_SECRET`; `authorizationBrokers.canva = CanvaConnectOAuthBroker`; desvio de `transportFactory` para `CanvaConnectTransport`; authorize `www.canva.com/api/oauth/authorize`; token exchange HTTP Basic em `api.canva.com/rest/v1/oauth/token`; transporte REST `/rest/v1` com probe `GET /users/me`; os oito scopes Connect no adapter; checkpoint `CP0_PORTAL_CONTRACT`. Nenhum app de Developer Portal é necessário.

**PRESERVE DORMANT (2)** — não apagar por reflexo: `mcp/canva-connect.ts` **permanece no disco, desroteado e fora do barrel `index.ts`** — é a única implementação pronta caso a allowlist seja negada; remoção apenas em commit separado, depois da Fase 1 aprovada. Os três testes Connect (authorization URL, Basic + rotação, `/users/me`) ficam como unitários dormentes importando o módulo direto; não provam rota de produção.

**RESTORE (4)** — voltam a ser rota ativa: `DynamicRegistrationOAuthBroker` como broker de `canva`; `RemoteHttpMcpTransport` com `endpointKey: "canva"`; `runtime.discover()` (`initialize` → `tools/list` → `replaceToolSnapshot` → `capabilitySnapshot`) como única fonte de capability; `createFakeCanvaTransport` como fixture de tools MCP (hoje vazio, honesto).

Conflito residual único: `production-runtime.ts` é o **único** ponto que roteia Canva para Connect. Catálogo, endpoint, callback, action, migration e registry já são MCP. O reroute é pequeno e cirúrgico.

## 4. Contrato arquitetural

```text
YZI IMOB
  ↓
generic connection runtime      (state, PKCE, attempts, Vault, tenant, eventos)
  ↓
Canva MCP broker/auth           (discovery, CIMD/DCR, authorize, token)
  ↓
Canva MCP transport             (Streamable HTTP, initialize)
  ↓
tools/list                      (snapshot versionado de tools reais)
  ↓
tool execution                  (McpOperation + binding + política)
  ↓
creative domain                 (job, revisão, asset, provenance)
  ↓
preview/review/export           (UI do gestor)
```

| Camada | Pode | Não pode |
|---|---|---|
| Runtime genérico | lifecycle, credenciais, tenant, eventos | conhecer design, asset, export ou nome de tool |
| MCP protocol | discovery, auth, transporte, `tools/list`, `tools/call` | traduzir tool em regra de produto |
| Canva tool mapping | tool real → `McpCapabilityKey`/`McpOperation` | inventar tool ausente do `tools/list` |
| Creative product layer | job, revisão, aprovação, asset, preview | falar MCP, expor tool name, token ou URL assinada |

Nenhuma tool MCP aparece na UI. O gestor vê estado humano e resultado.

## 5. Checkpoint inicial: `CP0_MCP_ACCESS_CONTRACT`

Substitui `CP0_PORTAL_CONTRACT`. Prova, sem segredo e sem OAuth real: (1) metadata MCP acessível com os cinco endpoints do §2; (2) auth metadata coerente com o que o broker consome, incluindo `S256`; (3) método de client registration definido — CIMD (recomendado), DCR (deprecado, já provado com `201`) ou registro manual; (4) host oficial declarado: `yzios.com.br`; (5) callback exata declarada: `https://yzios.com.br/api/yzi-imob/connections/canva/callback`; (6) status da allowlist para esse host; (7) processo externo necessário, com data de submissão e e-mail de contato quando executado; (8) nenhum app de Developer Portal criado; (9) nenhuma dependência de credencial Connect. Não há necessidade de Developer Portal nem de Connect APIs para o contrato MCP.

Estados terminais: `passed` (host na allowlist) · `external_handoff_required` (allowlist externa pendente, incluindo submissão ou resposta do formulário — **estado atual**) · `failure` (negativa, ou exigência de domínio/entidade que o YZI não controla). `external_handoff_required` congela as Fases 1–3 e não é falha do plano.

Estado registrado: `CP0_MCP_ACCESS_CONTRACT = external_handoff_required`. Motivo: allowlist Canva MCP ainda pendente para `yzios.com.br`.

## 6. Gate externo atual

Bloqueio observado no `authorize` real: `Invalid redirect URI. It must be from an allowed host.`

- **É allowlist?** Sim, com alta confiança: `POST /register` retornou `201` (registro é aberto) e a rejeição ocorre no `authorize`, sobre o redirect — exatamente o mecanismo que a documentação nomeia.
- **Host ou URI completa?** A mensagem diz host, a documentação diz redirect URI. **Não resolvido.** Informe a URI completa; assuma liberação por host.
- **A documentação confirma:** existe allowlist; a entrada é pelo formulário de waitlist; clientes populares já estão liberados; critérios de revisão publicados.
- **A documentação não confirma:** granularidade, prazo, se CIMD dispensa a allowlist, número de URIs por cliente, política sobre subdomínio de plataforma de hospedagem.
- **Ação humana:** só Eric pode submeter o formulário (`docs.google.com/forms/d/1jgC4vAA2-5LqaNzVhnP8ygSknF4Vysc1UzAWJukzcp0/viewform`), informando empresa, objetivo da integração, requisitos técnicos, prazo e a redirect URI oficial `https://yzios.com.br/api/yzi-imob/connections/canva/callback`. Nada no repositório destrava isso.
- **Host definitivo:** `yzios.com.br`, já apontado para a Vercel. `yzi-os.vercel.app` permanece apenas como host legado/fallback; não é o callback principal nem autoridade atual do contrato Canva.
- **Sem workaround:** proxy de redirect, host emprestado ou credencial de cliente pré-aprovado estão proibidos (§13).

## 7. Primeiro wire test após liberação

`authorization → callback → token → connection ready → initialize MCP → tools/list`

Prova exigida: `state` consumido uma única vez, verifier em Vault, `authorizationReference` gravada e evento persistido; `initialize` devolvendo `protocolVersion`/`serverInfo` reais do Canva; `tools/list` expondo a superfície da conta conectada; `capabilitySnapshot` derivado **só** de tools retornadas. Não avançar para Creative Studio, upload, export ou geração nesta etapa.

## 8. Capability mapping

`tools/list` vira snapshot interno pelo caminho que já existe (`runtime.discover()` → `buildToolSnapshot` → `replaceToolSnapshot` → `capabilitySnapshot` + `capabilitySnapshotVersion`). Reutilizar; não criar tabela nem taxonomia paralela.

Classificação obrigatória por tool: `tool_available` (retornada nesta conta) · `tool_unavailable` (documentada pelo Canva e ausente) · `plan_gated` (ausência explicada por plano, §2) · `not_implemented_in_yzi` (disponível, sem operação YZI mapeada) · `upstream_failure` (discovery falhou; snapshot não é evidência).

`CANVA_CAPABILITY_ALIASES` está vazio hoje — estado honesto. Só é preenchido com nomes observados no `tools/list` real.

## 9. Primeira capability produtiva

Escolhida **depois** do `tools/list`, pela superfície real da conta conectada. Não congelar "upload + design". Critérios, em ordem: valor direto para o imóvel; independência de editor e de handoff humano no Canva; não depender de Enterprise; output verificável byte a byte; baixo risco de efeito colateral na conta do cliente; encaixe em `CarouselRenderTransport`/`ExternalCreativeTransport` sem novo domínio de job.

Candidatas plausíveis pelo contrato oficial — a confirmar, não a assumir: `export-design` e `upload-asset-from-url`, ambas em todos os planos e com output verificável. `autofill-design` fica fora enquanto exigir Enterprise.

## 10. Creative domain

Conclusão da v2 preservada: verificar o schema existente antes de desenhar; estender, nunca duplicar; `source media ≠ derived media` — source em `yzi-imob-source-media`, derivados em `yzi-imob-private`, promoção a `yzi-imob-public` só após aprovação humana; nenhuma tabela ou bucket especulativo, com IDs Canva em metadata server-owned de asset/evento; preview, revisão e aprovação permanecem no YZI IMOB.

## 11. Plano de execução

**Fase 0 — MCP access contract.** Objetivo: transformar o bloqueio de allowlist em item externo rastreado. Preconditions: domínio oficial decidido como `yzios.com.br` (§6). Probe: GET da metadata pública e conferência da callback contra `MCP_ENDPOINT_CATALOG.canva.callbackPath`. Evidence: JSON de metadata, URI declarada, comprovante de submissão com data quando houver. DoD: `CP0_MCP_ACCESS_CONTRACT` em `passed` ou `external_handoff_required`. Estado atual: `external_handoff_required`, por allowlist pendente. Stop: `failure` ou qualquer tentativa de contornar a allowlist. Human gate: Eric submete o formulário; não envolve Developer Portal nem Connect APIs.

**Fase 1 — OAuth + MCP wire test.** Objetivo: o fluxo do §7. Preconditions: `CP0 = passed`. Arquivos prováveis: `mcp/production-runtime.ts` (reroute), `mcp/catalog.ts` (decisão de scope), `mcp/index.ts` (barrel), `tests/mcp-runtime.test.ts`; callback e action não mudam. Probe: authorize real → callback → conexão `authorized/ready/healthy`; `initialize` + `tools/list` com resposta do Canva. Evidence: attempt consumido, Vault ref, evento `discovery_completed` com `toolCount` real, lista de tools sanitizada. DoD: `CP1_MCP_WIRE`; nenhum token em log, UI ou DB fora do Vault. Stop: allowlist ainda bloqueia, scope rejeitado sem contrato oficial, ou `tools/list` vazio sem explicação. Human gate: consentimento no Canva com a conta piloto.

**Fase 2 — Capability mapping + primeira tool real.** Objetivo: snapshot classificado (§8) e uma tool executada de verdade. Preconditions: Fase 1 e capability escolhida pelos critérios do §9. Arquivos prováveis: `mcp/catalog.ts` (aliases e operations reais), `mcp/types.ts` se faltar `McpOperation`, testes. Probe: `tools/call` com input mínimo, resultado normalizado e sanitizado, rate limit respeitado. Evidence: snapshot versionado, `McpExecutionRequest`/`McpExecutionEvent`, resultado sem token nem URL assinada. DoD: `CP2_CAPABILITY_TRUTH`; toda capability publicada tem tool correspondente. Stop: tool ausente, gated por plano, ou resultado que exigiria expor URL assinada à UI. Human gate: aprovação antes de qualquer chamada com efeito na conta do cliente.

**Fase 3 — Creative integration.** Objetivo: artifact → preview → aprovação → storage, dentro do domínio existente. Preconditions: Fase 2 e schema creative verificado. Arquivos prováveis: transport Canva no domínio creative, factory/engines, testes creative; UI só para estados já existentes. Probe: fixture canônica produz o artefato esperado, com tenant/property/provenance íntegros e aprovação precedendo a promoção. Evidence: job/event chain, objeto em `yzi-imob-private`, preview assinado, promoção pós-aprovação. DoD: `CP3_CREATIVE_INTEGRATION`; gestor opera inteiramente no YZI IMOB. Stop: exigiria duplicar schema, novo bucket ou editor Canva. Human gate: aprovação do commit e de qualquer push.

Cada checkpoint falha fechado. Markdown sem query, teste, HTTP ou evento correspondente não é evidência.

## 12. Commit strategy

O `HEAD` anterior nunca conteve Canva. Portanto, a primeira versão Canva registrada no histórico nasce diretamente no estado arquitetural final MCP-first; não se fabrica um snapshot Connect apenas para simular o delta `Connect → MCP`, que continua documentado nas seções de auditoria desta v3.

1. **Canva MCP connection foundation** — registra `connection_kind = canva`, migration, callback, action, catálogo/registry, adapter sem scopes inventados, broker/transport MCP de produção, discovery por `tools/list` e testes. `canva-connect.ts` permanece dormente, fora do barrel e da rota produtiva. Exit: `CANVA_MCP_FOUNDATION = committed`, `npm run test:mcp` verde e nenhuma leitura de `CANVA_CONNECT_*` no caminho de produção.
2. **MCP wire validation** — evidência da Fase 1 e ajustes mínimos revelados pelo wire. Exit: `CP1_MCP_WIRE`.
3. **capability mapping** — aliases/operations reais e snapshot classificado. Exit: `CP2_CAPABILITY_TRUTH`.
4. **creative integration** — transport creative e testes. Exit: `CP3_CREATIVE_INTEGRATION`.

Commit documental separado registra esta v3: `CANVA_MCP_V3_SPEC = committed`. Commit opcional posterior pode remover `canva-connect.ts` e seus testes somente depois da validação wire; não misturar essa remoção com a fundação.

## 13. Do not reopen

Proibido sem decisão humana explícita e registrada: voltar a Connect APIs como rota principal; criar app no Developer Portal; pedir ou configurar Client ID/Secret Connect; inventar scopes Connect ou MCP; remover contratos genéricos válidos (runtime, Vault, tenant, attempts, state, PKCE, callback); reabrir Metricool ou Higgsfield nesta unidade; duplicar o schema creative ou criar bucket/tabela especulativa; criar editor Canva dentro do YZI IMOB; bypassar a allowlist por qualquer meio; usar credenciais de Claude, ChatGPT ou Codex; criar proxy de redirect não autorizado.

## Delta v2 → v3

**kept (12):** `connection_kind = 'canva'`; migration `20260815035008`; `MCP_ENDPOINT_CATALOG.canva`; rota de callback Canva; `startCanvaMcpAuthorizationAction`; entrada `canva` no `connections/catalog.ts`; `public-registry`; runtime genérico completo; `readCanvaMcpCallbackUrl` + `allowedCallbackOrigins`; domínio creative e seus transports; separação source vs. derived media; testes MCP de endpoint e de migration.

**reverted (9):** `CANVA_CONNECT_CLIENT_ID`; `CANVA_CONNECT_CLIENT_SECRET`; `CanvaConnectOAuthBroker` roteado; `CanvaConnectTransport` roteado; authorize `www.canva.com/api/oauth/authorize`; token exchange Basic em `api.canva.com/rest/v1/oauth/token`; REST `/rest/v1` com probe `/users/me`; oito scopes Connect no adapter; `CP0_PORTAL_CONTRACT`.

**restored (4):** `DynamicRegistrationOAuthBroker` para `canva`; `RemoteHttpMcpTransport` para `canva`; `runtime.discover()`/`tools/list` como fonte de capability; `createFakeCanvaTransport` como fixture de tools MCP.

**deprecated/dormant (2):** `mcp/canva-connect.ts` (no disco, desroteado, fora do barrel, removível só em commit separado); os três testes unitários Connect, mantidos sem valor de rota produtiva.

## Exact next action

1. Usar `yzios.com.br` como host oficial de produção; `yzi-os.vercel.app` fica legado/fallback.
2. Informar no handoff externo a URI exata `https://yzios.com.br/api/yzi-imob/connections/canva/callback`.
3. Eric submete o formulário de waitlist do Canva MCP (link no §6), fora desta execução.
4. Guardar data de submissão e e-mail de contato como evidência de `CP0`.
5. Manter `CP0_MCP_ACCESS_CONTRACT = external_handoff_required` enquanto a allowlist estiver pendente.
6. Executar apenas o commit 1 (reroute), que não depende da allowlist, e registrar `COMMIT_1_MCP_REROUTE = ready` após validação local.
7. Não executar Fases 1–3 nem OAuth real até a resposta do Canva.
8. Não criar app no Developer Portal, usar Connect APIs ou configurar credenciais Connect.
9. Nenhum outro passo técnico está desbloqueado hoje.

Estado de execução local após as validações do Commit 1: `COMMIT_1_MCP_REROUTE = ready`.
