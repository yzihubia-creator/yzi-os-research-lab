import { type NextRequest } from "next/server";

import {
  createProductionMcpRuntime,
  readHiggsfieldMcpCallbackUrl,
} from "@/lib/yzi-imob/mcp/production-runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const state = request.nextUrl.searchParams.get("state") ?? "";
  const code = request.nextUrl.searchParams.get("code") ?? "";
  let status = "provider_error";
  // O checkpoint acompanha a falha: sem ele, `internal_error` não é
  // diagnóstico. Nunca logar code, state, verifier ou token.
  let checkpoint = "callback_received";
  if (state && code && !request.nextUrl.searchParams.has("error")) {
    try {
      checkpoint = "complete_authorization";
      await createProductionMcpRuntime().completeAuthorizationFromCallback({
        state,
        code,
        callbackUrl: readHiggsfieldMcpCallbackUrl(),
      });
      status = "success";
    } catch (error) {
      status = "internal_error";
      console.error("[Higgsfield callback failed]", {
        checkpoint,
        name: error instanceof Error ? error.name : "Unknown",
        runtimeCode: readRuntimeCode(error),
        httpStatus: readHttpStatus(error),
        sqlstate: readSqlState(error),
        message: sanitizeMessage(error),
      });
    }
  }
  const serialized = JSON.stringify(status);
  const message = status === "success"
    ? "Conexao criativa concluida. Esta janela sera fechada."
    : "Nao foi possivel concluir a autorizacao.";
  const html = `<!doctype html><meta charset="utf-8"><title>Conexao criativa</title><body style="background:#0b0f14;color:#d8e2ee;font:14px system-ui;display:grid;place-items:center;height:100vh;margin:0"><p>${message}</p><script>if(window.opener){window.opener.postMessage({type:"yzi-connection-auth-complete",provider:"producao-criativa-complementar",status:${serialized}},window.location.origin)};if(${serialized}==="success")setTimeout(()=>window.close(),250);</script></body>`;
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "content-security-policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'",
    },
  });
}

/* --- Leitores de erro nativo. Sanitizados: nunca vazam segredo. --- */

function readRuntimeCode(error: unknown): string | null {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" && /^[a-z_]{1,48}$/.test(code) ? code : null;
}

function readSqlState(error: unknown): string | null {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" && /^[0-9A-Z]{5}$/.test(code) ? code : null;
}

function readHttpStatus(error: unknown): number | null {
  const status = (error as { status?: unknown } | null)?.status;
  if (typeof status === "number") return status;
  const match = error instanceof Error ? error.message.match(/^oauth_http_(\d{3})$/) : null;
  return match ? Number(match[1]) : null;
}

function sanitizeMessage(error: unknown): string {
  if (!(error instanceof Error)) return "unknown_error";
  return /^[a-z0-9_ $.-]{1,160}$/i.test(error.message) ? error.message : "redacted_error";
}
