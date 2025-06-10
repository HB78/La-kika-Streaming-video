// app/api/upload-proxy/route.js
import { pinata } from "@/app/utils/config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

// ✅ App Router : Pas de config.api, mais on peut gérer avec streaming
export async function POST(request) {
  try {
    console.log("=== Upload Proxy - Receiving file ===");

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileSizeMB = file.size / 1024 / 1024;
    console.log(`Proxying upload: ${file.name} (${fileSizeMB.toFixed(2)} MB)`);

    // ✅ Pour fichiers > 4MB, utiliser la méthode client-side de Pinata
    if (fileSizeMB > 4) {
      return NextResponse.json(
        {
          error: "File too large for server upload",
          suggestion: "Use client-side upload with signed URL",
          fileSize: fileSizeMB,
          limit: 4,
        },
        { status: 413 }
      );
    }

    // ✅ Upload à Pinata pour fichiers < 4MB
    const uploadResult = await pinata.upload.public.file(file, {
      pinataMetadata: {
        name: file.name,
        keyvalues: {
          uploadMethod: "server-proxy",
          timestamp: new Date().toISOString(),
        },
      },
    });

    console.log("Upload successful:", uploadResult.cid);

    // ✅ Générer URL publique
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
