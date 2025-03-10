import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { authOptions } from "../auth/[...nextauth]/route";
export const dynamic = "force-dynamic";

export const utapi = new UTApi();

const prisma = new PrismaClient();

function extractFileIdFromUrl(url) {
  if (!url) return null;
  const fileId = url.split("/").pop();
  return fileId;
}

export const DELETE = async (req) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({
      message: "vous n'êtes pas connecté",
      status: 401,
    });
  }

  if (session?.user.isAdmin === false) {
    return NextResponse.json({
      message: "vous n'êtes pas autorisé",
      status: 401,
    });
  }

  const checkIfUserIsAdmin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!checkIfUserIsAdmin) {
    return NextResponse.json({ error: "No user found", status: 404 });
  }

  if (checkIfUserIsAdmin.isAdmin === false) {
    return NextResponse.json({
      message: "vous n'avez pas les droits",
      status: 401,
    });
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
    if (serieWithEpisodes.photo) {
      const seriePhotoId = extractFileIdFromUrl(serieWithEpisodes.photo);
      if (seriePhotoId) filesToDelete.push(seriePhotoId);
    }

    // Récupérer les IDs des fichiers des épisodes
    for (const episode of serieWithEpisodes.episodeOwned) {
      if (episode.photo) {
        const episodePhotoId = extractFileIdFromUrl(episode.photo);
        if (episodePhotoId) filesToDelete.push(episodePhotoId);
      }

      if (episode.url) {
        const episodeUrlId = extractFileIdFromUrl(episode.url);
        if (episodeUrlId) filesToDelete.push(episodeUrlId);
      }
    }

    // Supprimer les fichiers
    if (filesToDelete.length > 0) {
      try {
        const deleteResult = await utapi.deleteFiles(filesToDelete);
        console.log("Fichiers supprimés:", deleteResult);
      } catch (fileError) {
        console.error("Erreur lors de la suppression des fichiers:", fileError);
        // On continue malgré l'erreur pour supprimer les données en base
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
    return NextResponse.json({ message: "deleted successfully", status: 500 });
  }
};
