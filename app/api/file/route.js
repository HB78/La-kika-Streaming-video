import { pinata } from "@/app/utils/config";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Gérer les uploads TUS (large files)
    if (
      contentType.includes("application/offset+octet-stream") ||
      request.headers.get("upload-offset") !== null ||
      request.headers.get("tus-resumable")
    ) {
      return await handleTusUpload(request);
    }

    // Gérer les uploads normaux (FormData)
    if (contentType.includes("multipart/form-data")) {
      return await handleFormDataUpload(request);
    }

    // Si ce n'est ni l'un ni l'autre, c'est probablement une création TUS
    return await handleTusCreation(request);
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Internal Server Error", details: e.message },
      { status: 500 }
    );
  }
}

// Gérer la création d'upload TUS (PATCH request initial)
async function handleTusCreation(request) {
  try {
    // Récupérer les métadonnées depuis les headers TUS
    const uploadMetadata = request.headers.get("upload-metadata");
    const uploadLength = request.headers.get("upload-length");

    if (!uploadLength) {
      return NextResponse.json(
        { error: "Upload-Length header is required" },
        { status: 400 }
      );
    }

    // Parser les métadonnées TUS (base64 encoded)
    let metadata = {};
    if (uploadMetadata) {
      const pairs = uploadMetadata.split(",");
      pairs.forEach((pair) => {
        const [key, value] = pair.trim().split(" ");
        if (value) {
          metadata[key] = Buffer.from(value, "base64").toString("utf-8");
        }
      });
    }

    // Créer l'upload avec Pinata
    const response = NextResponse.json({}, { status: 201 });

    // Headers TUS requis
    response.headers.set("tus-resumable", "1.0.0");
    response.headers.set("upload-offset", "0");
    response.headers.set("location", `/api/file/${Date.now()}`);

    return response;
  } catch (error) {
    console.error("TUS creation error:", error);
    return NextResponse.json(
      { error: "TUS creation failed", details: error.message },
      { status: 500 }
    );
  }
}

// Gérer l'upload TUS en cours (PATCH requests)
async function handleTusUpload(request) {
  try {
    const uploadOffset = request.headers.get("upload-offset");
    const contentLength = request.headers.get("content-length");

    // Récupérer le body comme ArrayBuffer
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convertir en File object pour Pinata
    const file = new File([buffer], "large-file", {
      type: "application/octet-stream",
    });

    // Upload avec Pinata
    const uploadData = await pinata.upload.public.file(file, {
      pinataMetadata: {
        name: `large-upload-${Date.now()}`,
        keyvalues: {
          uploadType: "tus",
          offset: uploadOffset,
        },
      },
    });

    // Réponse TUS
    const response = NextResponse.json(uploadData, { status: 204 });
    response.headers.set("tus-resumable", "1.0.0");
    response.headers.set(
      "upload-offset",
      (parseInt(uploadOffset) + buffer.length).toString()
    );

    return response;
  } catch (error) {
    console.error("TUS upload error:", error);
    return NextResponse.json(
      { error: "TUS upload failed", details: error.message },
      { status: 500 }
    );
  }
}

// Gérer les uploads FormData normaux
async function handleFormDataUpload(request) {
  try {
    const data = await request.formData();
    const file = data.get("file");
    const metadata = data.get("metadata");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload avec métadonnées si disponibles
    if (metadata) {
      const metadataObj = JSON.parse(metadata);
      const uploadData = await pinata.upload.public.file(file, {
        pinataMetadata: {
          name: metadataObj.filename,
          keyvalues: {
            filetype: metadataObj.filetype,
            network: metadataObj.network,
          },
        },
      });
      return NextResponse.json(uploadData, { status: 200 });
    }

    // Upload simple
    const uploadData = await pinata.upload.public.file(file);
    return NextResponse.json(uploadData, { status: 200 });
  } catch (error) {
    console.error("FormData upload error:", error);
    throw error;
  }
}

// Gérer les requests OPTIONS pour CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, PATCH, OPTIONS, HEAD",
      "Access-Control-Allow-Headers":
        "Content-Type, Upload-Offset, Upload-Length, Tus-Resumable, Upload-Metadata",
      "Tus-Resumable": "1.0.0",
      "Tus-Version": "1.0.0",
      "Tus-Max-Size": "1073741824", // 1GB
    },
  });
}

// Gérer les requests HEAD pour TUS
export async function HEAD(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Tus-Resumable": "1.0.0",
      "Upload-Offset": "0",
    },
  });
}

// Gérer les requests PATCH pour TUS
export async function PATCH(request) {
  return await handleTusUpload(request);
}
