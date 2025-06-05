//UPLOAD FILES FOR LARGE VIDEOS

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Retourne l'endpoint TUS officiel de Pinata avec le JWT
    return NextResponse.json(
      {
        endpoint: "https://uploads.pinata.cloud/v3/files",
        jwt: process.env.PINATA_JWT,
        chunkSize: 50 * 1024 * 1024, // 50MB chunks (max autorisé par Pinata)
        retryDelays: [0, 3000, 5000, 10000, 20000],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting TUS config:", error);
    return NextResponse.json(
      { error: "Error getting TUS configuration" },
      { status: 500 }
    );
  }
}
