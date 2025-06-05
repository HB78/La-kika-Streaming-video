import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST - Proxy pour TUS sans exposer le JWT
export async function POST(request) {
  try {
    const url = new URL(request.url);
    const tusUploadId = url.searchParams.get("upload_id");

    // Headers TUS à transférer
    const tusHeaders = {
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
      "Tus-Resumable": request.headers.get("Tus-Resumable") || "1.0.0",
      "Content-Type":
        request.headers.get("Content-Type") ||
        "application/offset+octet-stream",
    };

    // Ajouter les headers spécifiques selon le type de requête TUS
    if (request.headers.get("Upload-Offset")) {
      tusHeaders["Upload-Offset"] = request.headers.get("Upload-Offset");
    }
    if (request.headers.get("Upload-Length")) {
      tusHeaders["Upload-Length"] = request.headers.get("Upload-Length");
    }
    if (request.headers.get("Upload-Metadata")) {
      tusHeaders["Upload-Metadata"] = request.headers.get("Upload-Metadata");
    }

    // Construire l'URL Pinata
    let pinataUrl = "https://uploads.pinata.cloud/v3/files";
    if (tusUploadId) {
      pinataUrl += `/${tusUploadId}`;
    }

    // Transférer la requête à Pinata
    const pinataResponse = await fetch(pinataUrl, {
      method: request.method,
      headers: tusHeaders,
      body: request.method !== "HEAD" ? request.body : undefined,
    });

    // Créer la réponse en copiant les headers TUS de Pinata
    const responseHeaders = new Headers();

    // Copier les headers TUS importants
    const tusResponseHeaders = [
      "Tus-Resumable",
      "Upload-Offset",
      "Upload-Length",
      "Location",
      "Tus-Version",
      "Tus-Extension",
      "Tus-Max-Size",
    ];

    tusResponseHeaders.forEach((header) => {
      const value = pinataResponse.headers.get(header);
      if (value) {
        responseHeaders.set(header, value);
      }
    });

    // Headers CORS
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set(
      "Access-Control-Allow-Methods",
      "POST, HEAD, PATCH, DELETE, GET"
    );
    responseHeaders.set(
      "Access-Control-Allow-Headers",
      "Tus-Resumable, Upload-Offset, Upload-Length, Upload-Metadata, Content-Type"
    );
    responseHeaders.set(
      "Access-Control-Expose-Headers",
      "Tus-Resumable, Upload-Offset, Upload-Length, Location, Tus-Version, Tus-Extension, Tus-Max-Size"
    );

    // Retourner la réponse avec le bon status et body
    return new Response(pinataResponse.body, {
      status: pinataResponse.status,
      statusText: pinataResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy TUS error:", error);
    return NextResponse.json({ error: "TUS proxy failed" }, { status: 500 });
  }
}

// HEAD - Pour les requêtes TUS de vérification d'offset
export async function HEAD(request) {
  return POST(request);
}

// PATCH - Pour les uploads TUS par chunks
export async function PATCH(request) {
  return POST(request);
}

// OPTIONS - Pour CORS preflight
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, HEAD, PATCH, DELETE, GET, OPTIONS",
      "Access-Control-Allow-Headers":
        "Tus-Resumable, Upload-Offset, Upload-Length, Upload-Metadata, Content-Type, Authorization",
      "Access-Control-Expose-Headers":
        "Tus-Resumable, Upload-Offset, Upload-Length, Location, Tus-Version, Tus-Extension, Tus-Max-Size",
      "Tus-Resumable": "1.0.0",
      "Tus-Version": "1.0.0",
      "Tus-Extension": "creation,expiration",
      "Tus-Max-Size": "5368709120", // 5GB
    },
  });
}
