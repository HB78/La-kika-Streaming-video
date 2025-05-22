//je n'ai pas voulu cette fois ci  [id] dans la route API
//je voulais inclure id dans le body et non dans l'url API
//je voulais gagner du temps et simplifier la logique

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
