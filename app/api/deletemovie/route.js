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
    return new NextResponse("vous n'êtes pas connecté", { status: 401 });
  }

  if (session?.user.isAdmin === false) {
    return new NextResponse("vous n'êtes pas autorisé", { status: 401 });
  }

  const checkIfUserIsAdmin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!checkIfUserIsAdmin) {
    return NextResponse.json({ error: "No user found", status: 404 });
  }

  if (checkIfUserIsAdmin.isAdmin === false) {
    return new NextResponse("vous n'avez pas les droits", { status: 401 });
  }

  try {
    let body = await req.json();
    const { id } = body;

    if (!id) {
      return new NextResponse("il manque de la donnée", { status: 400 });
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
      if (filePhoto) filesToDelete.push(filePhoto);
    }

    if (movieFounded?.url) {
      const fileUrl = extractFileIdFromUrl(movieFounded.url);
      if (fileUrl) filesToDelete.push(fileUrl);
    }

    if (filesToDelete.length > 0) {
      const deleteResult = await utapi.deleteFiles(filesToDelete);
      console.log("Fichiers supprimés:", deleteResult);
    }

    // Suppression du film de la base de données
    const deletedItem = await prisma.film.delete({
      where: { id },
    });

    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "film deleted",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return NextResponse.json(
      {
        success: false,
        error: error,
      },
      { status: 500 }
    );
  }
};
