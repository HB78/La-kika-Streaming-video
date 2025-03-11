//je n'ai pas voulu cette fois ci  [id] dans la route API
//je voulais inclure id dans le body et non dans l'url API
//je voulais gagner du temps et simplifier la logique

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

  if (checkIfUserIsAdmin?.isAdmin === false) {
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

    const episodeFounded = await prisma.episode.findUnique({
      where: { id: id },
    });

    if (!episodeFounded) {
      return NextResponse.json({ error: "no episode found", status: 400 });
    }

    // Vérifier si au moins un des deux fichiers existe
    if (!episodeFounded?.photo && !episodeFounded.url) {
      return NextResponse.json({
        message: "aucune photo ni url trouvés",
        status: 404,
      });
    }
    // Récupération des fileIds et suppression des fichiers
    const filesToDelete = [];

    if (episodeFounded?.photo) {
      const filePhoto = extractFileIdFromUrl(episodeFounded.photo);
      if (filePhoto) filesToDelete.push(filePhoto);
    }

    if (episodeFounded?.url) {
      const fileUrl = extractFileIdFromUrl(episodeFounded.url);
      if (fileUrl) filesToDelete.push(fileUrl);
    }

    if (filesToDelete.length > 0) {
      const deleteResult = await utapi.deleteFiles(filesToDelete);
      console.log("Fichiers supprimés:", deleteResult);
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
