import { NextResponse } from "next/server";

const allow_origin_lists = [
  "https://lakika.vercel.app",
  "http://localhost:3000",
  "https://uploads.pinata.cloud",
];

const isDevelopment = process.env.NODE_ENV === "development";

export const middleware = async (req) => {
  const origin = req.headers.get("origin");

  if (origin && !allow_origin_lists.includes(origin)) {
    return new NextResponse(null, {
      status: 403,
      statusText: "Forbidden",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const res = NextResponse.next();

  // Ajouter les headers CORS
  appendCorsHeaders(res.headers, origin);

  // Ajouter les headers CSP
  appendCspHeaders(res.headers);

  return res;
};

function appendCorsHeaders(headers, origin) {
  headers.append("Access-Control-Allow-Credentials", "true");
  headers.append("Access-Control-Allow-Origin", origin);
  headers.append(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  headers.append(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Content-Type, Content-Length, Content-MDS, Accept, Accept-Version, Date, X-Api-Version"
  );
}

function appendCspHeaders(headers) {
  const policy = isDevelopment
    ? "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self'; " +
      "connect-src 'self' https:; " +
      "frame-src 'self';"
    : "default-src 'self'; " +
      "script-src 'self' https://lakika.vercel.app; " +
      "style-src 'self' https://lakika.vercel.app; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' https://lakika.vercel.app; " +
      "connect-src 'self' https:; " +
      "frame-src 'self';";

  headers.set("Content-Security-Policy", policy);
}

export const config = {
  matcher: ["/api/:path*"],
};
