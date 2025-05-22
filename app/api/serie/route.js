import prisma from "@/lib/singleton/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "./../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export const POST = async (req) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("vous n'êtes pas connecté", { status: 401 });
  }

  if (session.user?.isAdmin === false) {
    return new NextResponse("vous n'êtes pas autorisé", { status: 401 });
  }

  //on devrait rajouter une requete en plus pour aller voir si le user est admin dans la base de donée et ne pas se fier à la session

  const checkIfUserIsAdmin = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (checkIfUserIsAdmin.isAdmin === false) {
    return new NextResponse("vous n'avez pas les droits", { status: 401 });
  }

  let body = await req.json();
  const { title, photo } = body;

  if (!title || !photo) {
    return new NextResponse("il manque de la donnée", { status: 400 });
  }

  try {
    const newSerie = await prisma.serie.create({
      data: { title, photo },
    });
    console.log("newSerie:", newSerie);

    const serieRegistered = JSON.stringify(newSerie);

    return new NextResponse("serie ajouté avec succes", {
      status: 201,
      message: serieRegistered,
    });
  } catch (error) {
    console.log("error:", error);
    return new NextResponse("erreur du serveur dans la fonction create user", {
      status: 500,
    });
  }
};

export const GET = async (req) => {
  const allSeries = await prisma.serie.findMany({
    orderBy: {
      createdAt: "desc", // ou 'asc' si tu veux du plus ancien au plus récent
    },
  });

  if (!allSeries) {
    return new NextResponse("il n'a plus de series", { status: 400 });
  }

  const seriesFounded = JSON.stringify(allSeries);

  return new NextResponse(seriesFounded, {
    status: 200,
    message: "Les films de la Kollection",
  });
};
