import { pinata } from "@/app/utils/config";
import { NextResponse } from "next/server";

// Désactiver le body parser automatique pour TUS
export const bodyParser = false;

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get("file");
    const metadata = data.get("metadata");

    if (!file) {
      return NextResponse.json({ error: "No file provided" });
    }

    // Handle upload with metadata
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

    // Handle regular upload
    const uploadData = await pinata.upload.public.file(file);
    return NextResponse.json(uploadData, { status: 200 });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Internal Server Error", details: e.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const data = await request.formData();
    const file = data.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        {
          status: 400,
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

    const uploadData = await pinata.upload.public.file(file);
    return NextResponse.json(uploadData, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With",
      },
    });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Internal Server Error", details: e.message },
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

// Gérer les requêtes PATCH pour TUS
export async function PATCH(request) {
  try {
    const contentType = request.headers.get("content-type");

    if (
      contentType &&
      contentType.includes("application/offset+octet-stream")
    ) {
      // C'est une requête TUS PATCH
      const body = await request.arrayBuffer();
      const uploadId = request.headers.get("upload-id");

      // Pour l'instant, on va utiliser l'approche Pinata directe
      return NextResponse.json(
        { error: "TUS upload not fully implemented" },
        { status: 501 }
      );
    }

    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  } catch (e) {
    console.error("PATCH error:", e);
    return NextResponse.json(
      { error: "Internal Server Error", details: e.message },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
    },
  });
}
