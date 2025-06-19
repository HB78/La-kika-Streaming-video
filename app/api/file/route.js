import { pinata } from "@/app/utils/config";
import { NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};
export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get("file");
    const metadata = data.get("metadata");

    if (!file) {
      return NextResponse.json({ error: "No file provided" });
    }

    // Handle TUS upload (large files)
    //Si il y a des metadata, c'est un gros fichier
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

    // Handle regular upload (small files)
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
