import { pinata } from "@/app/utils/config";
import { NextResponse } from "next/server";

// export const bodyParser = false;

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

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

// Handle PATCH requests for TUS
export async function PATCH(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const uploadOffset = request.headers.get("upload-offset");
    const uploadMetadata = request.headers.get("upload-metadata");

    if (!uploadOffset) {
      return NextResponse.json(
        { error: "Missing upload-offset header" },
        { status: 400 }
      );
    }

    const file = await request.blob();

    if (uploadMetadata) {
      const metadataObj = JSON.parse(
        Buffer.from(uploadMetadata, "base64").toString()
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

      return new NextResponse(null, {
        status: 204,
        headers: {
          "Upload-Offset": uploadOffset,
          "Tus-Resumable": "1.0.0",
        },
      });
    }

    return NextResponse.json(
      { error: "Missing upload metadata" },
      { status: 400 }
    );
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Internal Server Error", details: e.message },
      { status: 500 }
    );
  }
}
