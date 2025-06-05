//UPLOAD FILES FOR LARGE VIDEOS
import { pinata } from "@/app/utils/config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST - Upload avec streaming de progression
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const metadata = formData.get("metadata");

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    // Parse metadata si fourni
    let parsedMetadata = {};
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (e) {
        console.warn("Invalid metadata format, using defaults");
      }
    }

    console.log(`Starting upload for file: ${file.name} (${file.size} bytes)`);

    // Créer un stream de progression
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Envoyer le statut de début
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "progress",
                progress: 0,
                status: "starting",
              })}\n\n`
            )
          );

          // Simuler la progression pendant l'upload
          const progressInterval = setInterval(() => {
            const randomProgress = Math.min(90, Math.random() * 80 + 10);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "progress",
                  progress: Math.round(randomProgress),
                  status: "uploading",
                })}\n\n`
              )
            );
          }, 1000);

          // Upload réel avec Pinata
          const upload = await pinata.upload.public.file(file, {
            metadata: {
              name: parsedMetadata.name || file.name,
              keyvalues: parsedMetadata.keyvalues || {},
            },
            group: parsedMetadata.groupId || undefined,
          });

          // Arrêter le progress simulé
          clearInterval(progressInterval);

          // Envoyer le succès final
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                progress: 100,
                status: "completed",
                success: true,
                cid: upload.cid,
                id: upload.id,
                name: upload.name,
                size: upload.size,
                mimeType: upload.mime_type,
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          console.error("Upload error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                status: "error",
                error: "Upload failed",
                details: error.message,
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Server-side upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
