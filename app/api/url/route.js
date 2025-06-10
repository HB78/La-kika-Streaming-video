// Le fichier pour upload en utilisant Pinata et en passant par le coté client
// cela marche pour les gros fichiers on outre passe la limite de Next.js

// Cette route sert uniquement à obtenir une URL signée de Pinata pour les uploads directs. Elle est utilisée pour les petits fichiers. UN UPLOAD EXPRESS RAPIDE ET DIRECT

import { pinata } from "@/app/utils/config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url = await pinata.upload.public.createSignedURL({
      expires: 30, // URL valide pendant 30 secondes
    });
    return NextResponse.json({ url: url }, { status: 200 });
  } catch (error) {
    console.error("Error creating signed URL:", error);
    return NextResponse.json(
      { error: "Error creating signed URL" },
      { status: 500 }
    );
  }
}
