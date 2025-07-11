// Le fichier pour upload en utilisant Pinata et en passant par le coté client
// cela marche pour les gros fichiers on outre passe la limite de Next.js

// Cette route sert uniquement à obtenir une URL signée de Pinata pour les uploads directs. Elle est utilisée pour les petits fichiers. UN UPLOAD EXPRESS RAPIDE ET DIRECT

import { pinata } from "@/app/utils/config";
import { isAdmin } from "@/lib/dryApiFunction/isAdmin";
import { NextResponse } from "next/server";

// export const dynamic = "force-dynamic";

export async function POST(req) {
  // If you're going to use auth you'll want to verify here
  const adminCheck = await isAdmin();

  // Vérifier si c'est une erreur
  if (adminCheck.status !== 200) {
    return adminCheck; // Retourner directement l'erreur
  }

  try {
    const data = await req.formData();
    const file = data.get("file");

    const { cid } = await pinata.upload.public.file(file);
    const url = await pinata.gateways.public.convert(cid);
    return NextResponse.json(
      { url: url, message: "upload de gros fichier réussi coté back" },
      { status: 200 }
    ); // Returns the signed upload URL
  } catch (error) {
    console.log("error: API URL", error);
    return NextResponse.json(
      { text: "Error creating API Key:" },
      { status: 500 }
    );
  }
}
