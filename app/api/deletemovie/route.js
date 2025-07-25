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

    // Suppression des fichiers sur S3
    if (filesToDelete.length > 0) {
      for (const key of filesToDelete) {
        try {
          await deleteFileFromS3(key);
          console.log("Fichier supprimé sur S3:", key);
        } catch (e) {
          console.error("Erreur suppression S3:", e);
          // Tu peux choisir de continuer ou de retourner une erreur ici
        }
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
