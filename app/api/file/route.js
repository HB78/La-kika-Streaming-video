// app/api/upload-direct/route.js
import { pinata } from "@/app/utils/config";
import { NextResponse } from "next/server";

export async function POST(request) {
  console.log("=== API /api/upload-direct POST ===");

  try {
    const data = await request.formData();
    const file = data.get("file");
    const metadata = data.get("metadata");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(`Direct upload: ${file.name}, size: ${file.size} bytes`);

    let uploadData;
    if (metadata) {
      const metadataObj = JSON.parse(metadata);
      uploadData = await pinata.upload.public.file(file, {
        pinataMetadata: {
          name: metadataObj.filename,
          keyvalues: {
            filetype: metadataObj.filetype,
            network: metadataObj.network || "public",
          },
        },
      });
    } else {
      uploadData = await pinata.upload.public.file(file, {
        pinataMetadata: {
          name: file.name,
        },
      });
    }

    console.log("Direct upload success:", uploadData);
    return NextResponse.json(uploadData, { status: 200 });
  } catch (error) {
    console.error("Direct upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
