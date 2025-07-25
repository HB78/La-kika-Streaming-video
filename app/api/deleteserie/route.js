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

    // Récupérer la série avec ses épisodes
    const serieWithEpisodes = await prisma.serie.findUnique({
      where: { id },
      include: { episodeOwned: true },
    });

    if (!serieWithEpisodes) {
      return NextResponse.json({ error: "Serie non trouvée", status: 404 });
    }

    // Fichiers à supprimer
    const filesToDelete = [];

    // Récupérer l'ID de la photo de la série
    if (serieWithEpisodes?.photo) {
      const seriePhotoId = extractFileIdFromUrl(serieWithEpisodes.photo);
      if (seriePhotoId) filesToDelete.push(seriePhotoId);
    }

    // Récupérer les IDs des fichiers des épisodes
    for (const episode of serieWithEpisodes.episodeOwned) {
      if (episode.url) {
        const episodeUrlId = extractFileIdFromUrl(episode.url);
        if (episodeUrlId) filesToDelete.push(episodeUrlId);
      }
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

    // Supprimer la série (les épisodes seront supprimés automatiquement grâce à onDelete: Cascade)
    const deletedSerie = await prisma.serie.delete({
      where: { id },
    });

    revalidatePath("/series");

    return NextResponse.json({
      success: true,
      message: "Série et tous ses épisodes supprimés",
      deletedSerie,
      filesDeleted: filesToDelete.length,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la suppression de la série",
      error: error.message,
      status: 500,
    });
  }
};
