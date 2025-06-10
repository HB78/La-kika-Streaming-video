// Le fichier pour upload en utilisant Pinata et en passant par le coté client
// cela marche pour les gros fichiers on outre passe la limite de Next.js

// Cette route sert uniquement à obtenir une URL signée de Pinata pour les uploads directs. Elle est utilisée pour les petits fichiers. UN UPLOAD EXPRESS RAPIDE ET DIRECT

import { pinata } from "@/app/utils/config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Configuration pour les gros fichiers
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

export async function GET() {
  // If you're going to use auth you'll want to verify here
  try {
    const url = await pinata.upload.public.createSignedURL({
      expires: 30, // URL valide pendant 30 secondes
      options: {
        network: "public",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, DELETE, OPTIONS, PATCH",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With",
        },
      },
    });

    return NextResponse.json(
      { url: url },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, DELETE, OPTIONS, PATCH",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With",
        },
      }
    );
  } catch (error) {
    console.error("Error creating signed URL:", error);
    return NextResponse.json(
      { error: "Error creating signed URL" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, DELETE, OPTIONS, PATCH",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With",
        },
      }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload to Pinata
    const uploadData = await pinata.upload.public.file(file);

    return NextResponse.json(
      {
        cid: uploadData.cid,
        url: await pinata.gateways.public.convert(uploadData.cid),
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Internal Server Error", details: e.message },
      { status: 500 }
    );
  }
}
