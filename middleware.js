import { NextResponse } from "next/server";

const allow_origin_lists = ["https://lakika.vercel.app"];
const isDevelopment = process.env.NODE_ENV === "development";

export const middleware = async (req) => {
  const origin = req.headers.get("origin");
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  if (origin && !allow_origin_lists.includes(origin)) {
    return new NextResponse(null, {
      status: 403,
      statusText: "Forbidden",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);

  const cspHeader = generateCspHeader(nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Ajouter les headers CORS
  appendCorsHeaders(res.headers, origin);

  // Ajouter les headers CSP
  res.headers.set("Content-Security-Policy", cspHeader);

  return res;
};

function appendCorsHeaders(headers, origin) {
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Content-Type, Content-Length, Content-MDS, Accept, Accept-Version, Date, X-Api-Version"
  );
}

function generateCspHeader(nonce) {
  const policy = isDevelopment
    ? `default-src 'self'; 
       script-src 'self' 'nonce-${nonce}' 'strict-dynamic'; 
       style-src 'self' 'nonce-${nonce}'; 
       img-src 'self' data: https:; 
       font-src 'self'; 
       connect-src 'self' https:; 
       frame-src 'self';`
    : `default-src 'self'; 
       script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://lakika.vercel.app; 
       style-src 'self' 'nonce-${nonce}' https://lakika.vercel.app; 
       img-src 'self' data: https:; 
       font-src 'self' https://lakika.vercel.app; 
       connect-src 'self' https:; 
       frame-src 'self';`;

  return policy.replace(/\s+/g, " ").trim();
}
