import { pinata } from "@/app/utils/config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60; // Max sur plan Hobby

export async function POST(request) {
  try {
    console.log("=== Upload Proxy - Receiving file ===");

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(
      `Proxying upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
    );

    // Upload direct à Pinata via le serveur (pas de CORS)
    const uploadResult = await pinata.upload.public.file(file, {
      pinataMetadata: {
        name: file.name,
        keyvalues: {
          uploadMethod: "proxy",
          timestamp: new Date().toISOString(),
        },
      },
    });

    console.log("Upload successful:", uploadResult.cid);

    // Générer URL publique
    const publicUrl = await pinata.gateways.public.convert(uploadResult.cid);

    return NextResponse.json({
      success: true,
      cid: uploadResult.cid,
      url: publicUrl,
      name: uploadResult.name,
      size: uploadResult.size,
      mimeType: uploadResult.mime_type,
    });
  } catch (error) {
    console.error("Proxy upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
