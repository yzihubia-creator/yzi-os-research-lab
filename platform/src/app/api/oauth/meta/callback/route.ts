import { NextResponse, type NextRequest } from "next/server";

import {
  handleMetaOAuthCallbackRequest,
} from "@/lib/yzi-imob/connections/meta-oauth-callback";
import {
  getMetaOAuthCallbackServerRpcClient,
} from "@/lib/yzi-imob/connections/meta-oauth-callback-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await handleMetaOAuthCallbackRequest(
    request.nextUrl,
    getMetaOAuthCallbackServerRpcClient,
  );

  return NextResponse.redirect(result.redirectUrl);
}
