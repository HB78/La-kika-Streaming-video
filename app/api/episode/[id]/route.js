import prisma from "@/lib/singleton/prisma";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { authOptions } from "./../../auth/[...nextauth]/route";

export const POST = async (req, { params }) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("vous n'êtes pas connecté", { status: 401 });
  }

  if (session.user.isAdmin === false) {
    return new NextResponse("vous n'êtes pas autorisé", { status: 401 });
  }

  //on devrait rajouter une requete en plus pour aller voir si le user est admin dans la base de donée et ne pas se fier à la session

  const checkIfUserIsAdmin = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (checkIfUserIsAdmin.isAdmin === false) {
    return new NextResponse("vous n'avez pas les droits", { status: 401 });
  }

  const secondId = params.id;

  const serie = await prisma.serie.findFirst({
    where: {
      title: {
        equals: secondId,
      },
    },
  });

  if (!serie) {
    return new NextResponse("la serie n'existe pas", { status: 404 });
  }

  let body = await req.json();
  const { title, url } = body;

  if (!title || !url) {
    return new NextResponse("il manque de la donnée", { status: 400 });
  }

  try {
    const newEpisode = await prisma.episode.create({
      data: {
        title: title,
        url: url,
        serieOwnerId: serie.id,
      },
    });

    // Mise à jour de la série avec l'ID du nouvel épisode
    const updatedSerie = await prisma.serie.update({
      where: { id: serie.id },
      data: {
        episodeOwned: {
          connect: { id: newEpisode.id },
        },
      },
    });
    const episodeRegistered = JSON.stringify(newEpisode);

    revalidatePath(`https://lakika.vercel.app/serie/${serie.id}`);

    return new NextResponse("episode ajouté avec succes", {
      status: 201,
      message: episodeRegistered,
    });
  } catch (error) {
    console.log("error:", error);
    return new NextResponse("erreur du serveur dans la fonction create user", {
      status: 500,
    });
  }
};

export const GET = async (req, { params }) => {
  const id = params.id;
  console.log("id:", id);

  const serieWithEpisodes = await prisma.serie.findUnique({
    where: { id: id },
    include: {
      episodeOwned: true, // Ceci inclura les épisodes liés à la série
    },
  });

  if (!serieWithEpisodes) {
    return new NextResponse("la serie n'a pas d'épisode", { status: 400 });
  }

  const episodesOfSerieFounded = JSON.stringify(serieWithEpisodes);

  return new NextResponse(episodesOfSerieFounded, {
    status: 200,
    message: "Les films de la Kollection",
  });
};
