import { type NextRequest } from "next/server";
import { createProductionMcpRuntime, readMetricoolMcpCallbackUrl } from "@/lib/yzi-imob/mcp/production-runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const state = request.nextUrl.searchParams.get("state") ?? "";
  const code = request.nextUrl.searchParams.get("code") ?? "";
  let status = "provider_error";
  if (state && code && !request.nextUrl.searchParams.has("error")) {
    try {
      await createProductionMcpRuntime().completeAuthorizationFromCallback({ state, code, callbackUrl: readMetricoolMcpCallbackUrl() });
      status = "success";
    } catch { status = "internal_error"; }
  }
  const serialized = JSON.stringify(status);
  const message = status === "success" ? "Metricool conectado. Esta janela será fechada." : "Não foi possível concluir a autorização.";
  const html = `<!doctype html><meta charset="utf-8"><title>Metricool</title><body style="background:#0b0f14;color:#d8e2ee;font:14px system-ui;display:grid;place-items:center;height:100vh;margin:0"><p>${message}</p><script>if(window.opener){window.opener.postMessage({type:"yzi-connection-auth-complete",provider:"publicacao-social",status:${serialized}},window.location.origin)};if(${serialized}==="success")setTimeout(()=>window.close(),250);</script></body>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "content-security-policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'" } });
}
