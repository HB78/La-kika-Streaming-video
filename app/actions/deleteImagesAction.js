"use server";

import { pinata } from "@/app/utils/config";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const deleteImagesAction = async (fileId) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("vous n'êtes pas connecté", { status: 401 });
  }

  if (session.user?.isAdmin === false) {
    return new NextResponse("vous n'êtes pas autorisé", { status: 401 });
  }

  if (!fileId || fileId.trim() === "") {
    return {
      success: false,
      message: "Aucun fichier à supprimer: ID manquant",
    };
  }

  const fileFounded = await pinata.files.public.list().cid(fileId);
  if (!fileFounded || fileFounded.files.length === 0) {
    return {
      success: false,
      message: "Aucun fichier trouvé avec cet ID",
    };
  }

  try {
    const res = await pinata.files.public.delete([fileFounded.files[0].id]);

    return {
      success: true,
      message: "Fichier supprimé avec succès",
      data: res,
    };
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return {
      success: false,
      message: "Échec de la suppression du fichier",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
