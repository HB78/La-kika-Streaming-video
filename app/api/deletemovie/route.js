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

    const movieFounded = await prisma.film.findUnique({
      where: { id: id },
    });

    if (!movieFounded) {
      return NextResponse.json({ error: "no movie found", status: 400 });
    }

    // Vérifier si au moins un des deux fichiers existe
    if (!movieFounded?.photo && !movieFounded.url) {
      return NextResponse.json({
        message: "aucune photo ni url trouvés",
        status: 404,
      });
    }

    // Récupération des fileIds et suppression des fichiers
    const filesToDelete = [];

    if (movieFounded?.photo) {
      const filePhoto = extractFileIdFromUrl(movieFounded.photo);
      console.log("filePhoto:", filePhoto);
      if (filePhoto) {
        filesToDelete.push(filePhoto); // ❌ Erreur: toString(filePhoto) -> ✅ Correction: filePhoto
      }
    }

    if (movieFounded?.url) {
      const fileUrl = extractFileIdFromUrl(movieFounded.url);
      console.log("fileUrl:", fileUrl);
      if (fileUrl) {
        filesToDelete.push(fileUrl); // ❌ Erreur: toString(fileUrl) -> ✅ Correction: fileUrl
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
      }
    }

    // Suppression du film de la base de données
    try {
      await prisma.film.delete({
        where: { id },
      });
      console.log("Film supprimé de la base de données:", id);
    } catch (dbError) {
      console.error("Erreur lors de la suppression du film:", dbError);
      return NextResponse.json({
        error: "Erreur lors de la suppression du film",
        status: 500,
      });
    }

    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "film deleted",
      deletedFiles: filesToDelete,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return NextResponse.json({
      error: "Erreur lors de la suppression",
      status: 500,
    });
  }
};
