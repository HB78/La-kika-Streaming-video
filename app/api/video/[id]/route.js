import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export const GET = async (req, { params }) => {
  //il y a deux facon de recuperer l'id
  //soit on le recupere dans l'url
  const id = req.url.split("/video/")[1];
  console.log("id--->:", id);

  //soit on le recupere dans les params
  const secondId = params.id;
  console.log("secondId:", secondId);

  // return new NextResponse(id, { id: secondId });
  const oneMovie = await prisma.film.findUnique({
    where: {
      id: secondId,
    },
  });
  console.log("oneMovie:", oneMovie);

  if (!oneMovie) {
    return new NextResponse("il n'a plus de films", { status: 400 });
  }

  //le probleme c'est que oneMovie est un objetet que le .json de nextreponse ne marche pas, il faut stringify l'objet one movie avant de l'envoyer dans le nextresponse en return
  const theMovie = JSON.stringify(oneMovie);

  return new NextResponse(theMovie, {
    status: 200,
    message: "Le film de la Kollection",
  });
};
