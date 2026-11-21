import { type NextRequest, NextResponse } from "next/server";

function getBackendBaseUrl(): string {
  const envUrl =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://project-courier-service.vercel.app";

  let clean = envUrl.trim().replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
  // In server-side production proxy, ensure we point to the remote deployed backend
  if (
    process.env.NODE_ENV === "production" &&
    (clean.includes("localhost") || clean.includes("127.0.0.1"))
  ) {
    clean = "https://project-courier-service.vercel.app";
  }
  return clean;
}

async function handleProxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolvedParams = await params;
  const path = resolvedParams.path ? resolvedParams.path.join("/") : "";
  const backendBase = getBackendBaseUrl();
  const search = req.nextUrl.search;
  const targetUrl = `${backendBase}/api/v1/${path}${search}`;

  // Forward incoming headers
  const headers = new Headers(req.headers);
  headers.delete("host");

  const method = req.method;
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await req.blob() : undefined;

  try {
    const upstreamRes = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: "follow",
    });

    const responseHeaders = new Headers(upstreamRes.headers);
    // Strip upstream backend's hardcoded localhost CORS headers to prevent browser origin mismatch on Vercel
    responseHeaders.delete("access-control-allow-origin");
    responseHeaders.delete("access-control-allow-credentials");
    responseHeaders.delete("access-control-allow-methods");
    responseHeaders.delete("access-control-allow-headers");

    const data = await upstreamRes.blob();
    return new NextResponse(data, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      {
        success: false,
        statusCode: 502,
        message: `Failed to proxy request to backend: ${error?.message || "Unknown error"}`,
      },
      { status: 502 },
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const HEAD = handleProxy;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
