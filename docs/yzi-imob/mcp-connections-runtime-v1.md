# YZI IMOB — MCP Connections Runtime v1

## 1. Contrato genérico MCP

`McpConnectionRuntime` governa conexões remotas sem lógica de fornecedor no core. O endpoint é resolvido por `endpoint_key` em catálogo server-side; o browser envia somente intenção operacional allowlisted. O cliente Streamable HTTP implementa `initialize`, negociação, `tools/list`, `tools/call`, correlação, sessão, timeout, cancelamento, reconexão, limite de resposta e erro normalizado.

## 2. Autorização

O servidor cria tentativa com `state` obrigatório, de uso único e armazenado como hash. PKCE S256 é aplicado, callback precisa coincidir com origem e path allowlisted, e a tentativa é consumida antes da troca para impedir replay. Login e senha não integram o contrato. O grant é salvo apenas em secret vault; a conexão guarda referência opaca, escopos e expiração.

## 3. Sessão

Sessões MCP e cabeçalhos de autorização existem somente no transport server-side. Expiração, refresh failure e revogação removem capabilities executáveis. Revogação local é fail-closed mesmo quando a revogação remota falha.

## 4. Discovery

Após autorização: `initialize → tools/list → validação de schema → snapshot`. Cada discovery cria nova versão, desativa apenas a versão corrente anterior, preserva histórico e registra evento append-only. Ferramenta ausente, schema inválido ou health degradado remove a capability corrente sem apagar evidência anterior.

## 5. Capabilities

Uma capability só fica ativa quando há ferramenta descoberta com schema válido, escopos suficientes, policy interna e health saudável. Nomes internos normalizados cobrem leitura, calendário, conteúdo, métricas e publicação social; e modelos, limites, imagem, vídeo, jobs e outputs criativos. Operações de risco nunca são habilitadas por discovery sozinho.

## 6. Bindings

`McpConnectionBinding` separa owner da autorização e tenant consumidor. O vínculo define capability, prioridade determinística, validade, limite mensal e approval policy. Assim, uma conexão `platform`, `tenant` ou `operation` pode servir um tenant autorizado sem mudar adapter ou frontend. A troca é auditada e requests já criados preservam o `connection_id` original.

## 7. Execução governada

O executor resolve binding e conexão, valida tenant, autorização, expiração, health, capability, policy, approval, custo, limite, rate limit e circuit breaker. Depois resolve a tool a partir do snapshot server-side, valida input, executa com idempotência, timeout, cancelamento e um retry controlado para erro explicitamente retryable. Requests e eventos guardam somente metadata segura; respostas são normalizadas e limitadas.

O modo de produção desta unidade é `real_readonly`: escrita, publicação e geração paga falham fechado antes de `tools/call`. O modo `fake` existe exclusivamente para testes determinísticos.

## 8. Metricool

`MetricoolMcpAdapter` usa o endpoint catalogado `https://ai.metricool.com/mcp`. O fake cobre descoberta, marcas/perfis, calendário, conteúdo, métricas, status e falha parcial por destino. Criar, agendar e publicar exigem conteúdo e asset aprovados, destino mapeado, binding, approval e idempotência. Nenhuma publicação real foi executada.

## 9. Higgsfield

`HiggsfieldMcpAdapter` usa o endpoint catalogado `https://mcp.higgsfield.ai/mcp`. O fake cobre modelos, limites, preparação de imagem/vídeo, job, status, cancelamento e output privado com provenance. Geração exige custo conhecido, limite, approval e revisão humana; output nunca é promovido automaticamente. Nenhuma geração paga foi executada.

## 10. Segurança

- Sem login/senha no modelo ou frontend.
- Sem token, cookie, sessão, secret, header ou payload bruto em eventos.
- Authorization reference opaca e material sensível apenas no vault server-side.
- Endpoint, tool name e credenciais nunca vêm do browser.
- Callback inválido e replay são rejeitados.
- Tenant sem binding não executa; owner não implica permissão de uso.
- Revogação, expiração, refresh failure e health degradado bloqueiam execução.

## 11. Estados de frontend

A tela apresenta apenas estados humanos: Não conectado, Aguardando autorização, Conectando, Ativo, Precisa de atenção, Autorização expirada e Indisponível. Recursos exibidos: Publicação social, Calendário de conteúdo, Métricas sociais, Produção de imagens e Produção de vídeos. Identidade de fornecedor, protocolo, endpoint, token, tool, schema e sessão ficam fora do componente cliente.

## 12. Limites ainda não validados em runtime real

Não houve autorização externa, callback real, discovery remoto ou `tools/call` remoto nesta unidade. O repositório durável/secret manager de produção e a materialização do schema continuam externos a este código; nenhuma migration foi criada ou aplicada. Até esses componentes serem autorizados e ligados ao runtime, a ação real da tela permanece fail-closed. `metricool_real_authorization_validated`, `higgsfield_real_authorization_validated`, `metricool_real_runtime_validated` e `higgsfield_real_runtime_validated` permanecem `false`.
