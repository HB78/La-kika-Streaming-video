import prisma from "@/lib/singleton/prisma";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  let body = await req.json();
  if (!body.title) {
    return new NextResponse("il manque de la donnée", { status: 400 });
  }

  const serie = await prisma.serie.findUnique({
    where: { title: body.title },
  });

  if (!serie) {
    return new NextResponse("la serie n'existe pas", { status: 404 });
  }

  try {
    const serieWithEpisodes = await prisma.serie.findUnique({
      where: { title: body.title },
      include: {
        episodeOwned: true, // Ceci inclura les épisodes liés à la série
      },
    });

    if (!serieWithEpisodes) {
      return new NextResponse("la serie n'a pas d'épisode", { status: 200 });
    }

    const episodesOfSerieFounded = JSON.stringify(serieWithEpisodes);

    return new NextResponse(episodesOfSerieFounded, {
      status: 200,
      message: "Les episodes de la Kollection",
    });
  } catch (error) {
    console.log("error:", error);
  }
};
