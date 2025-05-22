import { pinata } from "@/app/utils/config";
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

    // Suppression des fichiers sur Pinata
    if (filesToDelete.length > 0) {
      try {
        console.log("Recherche des fichiers à supprimer:", filesToDelete);

        // Récupérer la liste des fichiers
        const fileList = await pinata.files.public.list();
        console.log("Liste des fichiers disponibles:", fileList);

        // Trouver les IDs correspondant aux CIDs
        const filesToDeleteWithIds = filesToDelete
          .map((cid) => {
            const file = fileList.files.find((f) => f.cid === cid);
            if (file) {
              console.log(`Fichier trouvé - CID: ${cid}, ID: ${file.id}`);
              return file.id;
            }
            console.log(`Fichier non trouvé pour le CID: ${cid}`);
            return null;
          })
          .filter((id) => id !== null);

        if (filesToDeleteWithIds.length > 0) {
          console.log(
            "Suppression des fichiers avec IDs:",
            filesToDeleteWithIds
          );
          const deleteResult =
            await pinata.files.public.delete(filesToDeleteWithIds);
          console.log("Résultat suppression:", deleteResult);
        } else {
          console.log("Aucun fichier trouvé à supprimer");
        }
      } catch (pinataError) {
        console.error("Erreur Pinata:", pinataError);
        console.error("Détails:", pinataError.message);
        // On continue même si la suppression Pinata échoue
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
