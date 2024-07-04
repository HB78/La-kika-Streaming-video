import { NextResponse } from "next/server";

export function middleware(request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self' 'self' style-src 'unsafe-inline' https://lakika.vercel.app;
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://lakika.vercel.app 'unsafe-inline';
    style-src 'self' 'nonce-${nonce}' https://lakika.vercel.app;
    img-src 'self' blob: data: https://lakika.vercel.app;
    font-src 'self' https://lakika.vercel.app;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;
  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue
  );

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue
  );

  return response;
}
