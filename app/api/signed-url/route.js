import { pinata } from "@/app/utils/config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { filename, filesize } = await request.json();

    console.log(`Creating signed URL for: ${filename} (${filesize} bytes)`);

    const signedUrl = await pinata.upload.public.createSignedURL({
      expires: 300, // 5 minutes
      options: {
        network: "public",
      },
    });

    return NextResponse.json({
      signedUrl,
      success: true,
    });
  } catch (error) {
    console.error("Error creating signed URL:", error);
    return NextResponse.json(
      { error: "Failed to create signed URL" },
      { status: 500 }
    );
  }
}
