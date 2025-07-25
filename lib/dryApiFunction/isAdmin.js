import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "../singleton/prisma";

export const isAdmin = async (req) => {
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

  //c'est la meme chose que la ligne 32 mais en mieux
  // if (!checkIfUserIsAdmin?.isAdmin) {
  //   return NextResponse.json({
  //     message: "vous n'avez pas les droits",
  //     status: 401,
  //   });
  // }

  return NextResponse.json({ status: 200 }); // Retourne une réponse 200 si admin
};
