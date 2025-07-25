"use server";

import { deleteFileFromS3 } from "@/app/utils/aws-s3-config";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const deleteImagesAction = async (fileId) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      success: false,
      message: "Vous n'êtes pas connecté",
    };
  }

  if (session.user?.isAdmin === false) {
    return {
      success: false,
      message: "Vous n'êtes pas autorisé",
    };
  }

  if (!fileId || fileId.trim() === "") {
    return {
      success: false,
      message: "Aucun fichier à supprimer: clé manquante",
    };
  }

  try {
    await deleteFileFromS3(fileId);
    return {
      success: true,
      message: "Fichier supprimé avec succès",
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
