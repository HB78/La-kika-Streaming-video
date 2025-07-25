//je n'ai pas voulu cette fois ci  [id] dans la route API
//je voulais inclure id dans le body et non dans l'url API
//je voulais gagner du temps et simplifier la logique

import { deleteFileFromS3 } from "@/app/utils/aws-s3-config";
import { extractFileIdFromUrl } from "@/lib/dryApiFunction/extractUrl";
import { isAdmin } from "@/lib/dryApiFunction/isAdmin";
import prisma from "@/lib/singleton/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export const DELETE = async (req) => {
  // Vérification si l'utilisateur est admin
  const adminCheck = await isAdmin();

  // Vérifier si c'est une erreur
  if (adminCheck.status !== 200) {
    return adminCheck; // Retourner directement l'erreur
  }

  try {
    let body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({
        message: "il manque de la donnée",
        status: 400,
      });
    }

    const episodeFounded = await prisma.episode.findUnique({
      where: { id: id },
    });

    if (!episodeFounded) {
      return NextResponse.json({ error: "no episode found", status: 400 });
    }

    // Vérifier si au moins un des deux fichiers existe
    if (!episodeFounded.url) {
      return NextResponse.json({
        message: "aucun url trouvés",
        status: 404,
      });
    }
    // Récupération des fileIds et suppression des fichiers
    const filesToDelete = [];

    if (episodeFounded?.url) {
      const fileUrl = extractFileIdFromUrl(episodeFounded.url);
      if (fileUrl) filesToDelete.push(fileUrl);
    }

    // Suppression des fichiers sur S3
    if (filesToDelete.length > 0) {
      for (const key of filesToDelete) {
        try {
          await deleteFileFromS3(key);
          console.log("Fichier supprimé sur S3:", key);
        } catch (e) {
          console.error("Erreur suppression S3:", e);
        }
      }
    }

    // Suppression de l'épisode de la base de données
    const deletedItem = await prisma.episode.delete({
      where: { id },
    });

    revalidatePath("/");

    return NextResponse.json({
      status: 200,
      message: "episode deleted",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return NextResponse.json({ message: "deleted successfully", status: 500 });
  }
};
