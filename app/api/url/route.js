// Le fichier pour upload en utilisant Pinata et en passant par le coté client
// cela marche pour les gros fichiers on outre passe la limite de Next.js

// Cette route sert uniquement à obtenir une URL signée de Pinata pour les uploads directs. Elle est utilisée pour les petits fichiers. UN UPLOAD EXPRESS RAPIDE ET DIRECT

import { pinata } from "@/app/utils/config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // If you're going to use auth you'll want to verify here
  try {
    const url = await pinata.upload.public.createSignedURL({
      expires: 1000 * 60 * 60 * 24 * 30, // The only required param
    });
    console.log("url:", url);
    return NextResponse.json({ url: url }, { status: 200 }); // Returns the signed upload URL
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { text: "Error creating API Key:" },
      { status: 500 }
    );
  }
}
