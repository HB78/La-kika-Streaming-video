import { pinata } from "@/app/utils/config";
import { NextResponse } from "next/server";

// export const bodyParser = false;

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Handle TUS upload (large files)
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
        return NextResponse.json(uploadData, { status: 200 });
      }
    }

    // Handle regular upload (small files)
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
