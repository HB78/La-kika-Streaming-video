import { pinata } from "@/app/utils/config";
import { NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Handle TUS upload
    if (contentType.includes("application/offset+octet-stream")) {
      const file = await request.blob();
      const metadata = request.headers.get("upload-metadata");

      if (metadata) {
        const metadataObj = JSON.parse(
          Buffer.from(metadata, "base64").toString()
        );
        const uploadData = await pinata.upload.public.file(file, {
          pinataMetadata: {
            name: metadataObj.filename,
            keyvalues: {
              filetype: metadataObj.filetype,
              network: metadataObj.network,
            },
          },
        });
        return NextResponse.json(uploadData, {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers":
              "Content-Type, Authorization, Upload-Length, Upload-Metadata, Tus-Resumable",
            "Tus-Resumable": "1.0.0",
          },
        });
      }
    }

    // Handle regular form data upload
    const formData = await request.formData();
    const file = formData.get("file");
    const metadata = formData.get("metadata");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Handle regular upload (small files)
    const uploadData = await pinata.upload.public.file(file);
    return NextResponse.json(uploadData, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}

// Handle TUS protocol
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, Upload-Length, Upload-Metadata, Tus-Resumable",
      "Tus-Resumable": "1.0.0",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function HEAD(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Tus-Resumable": "1.0.0",
      "Upload-Offset": "0",
      "Upload-Length": request.headers.get("Upload-Length"),
    },
  });
}
