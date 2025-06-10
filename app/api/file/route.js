import { pinata } from "@/app/utils/config";
import { NextResponse } from "next/server";

// export const bodyParser = false;

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const tusResumable = request.headers.get("tus-resumable");

    // Handle TUS upload creation
    if (tusResumable === "1.0.0") {
      const uploadLength = request.headers.get("upload-length");
      const uploadMetadata = request.headers.get("upload-metadata");

      if (!uploadLength) {
        return NextResponse.json(
          { error: "Missing upload-length header" },
          { status: 400 }
        );
      }

      // Return success response for TUS upload creation
      return new NextResponse(null, {
        status: 201,
        headers: {
          Location: "/api/file",
          "Tus-Resumable": "1.0.0",
          "Access-Control-Expose-Headers": "Location, Tus-Resumable",
        },
      });
    }

    // Handle TUS chunk upload
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
