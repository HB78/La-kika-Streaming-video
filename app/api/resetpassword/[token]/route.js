import prisma from "@/lib/singleton/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export const PUT = async (req, { params }) => {
  const { token } = params;

  let body = await req.json();

  const { newPassword, id } = body;

  if (!newPassword) {
    return new NextResponse(
      JSON.stringify("remplissez le champs mot de passe"),
      {
        status: 400,
      }
    );
  }
  if (newPassword.length < 4 || newPassword.length > 50) {
    return new NextResponse(
      JSON.stringify("Le mot de passe doit contenir entre 4 et 80 caractères"),
      {
        status: 400,
      }
    );
  }

  const findUserIfExist = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!findUserIfExist) {
    return new NextResponse(JSON.stringify("Cet utilisateur est inexistant"), {
      status: 400,
    });
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET_LOST_PASSWORD);
    if (
      decodedToken.id !== findUserIfExist.id ||
      decodedToken.email !== findUserIfExist.email
    ) {
      return new NextResponse(JSON.stringify("Action non autorisée"), {
        status: 400,
      });
    }
  } catch (error) {
    console.error("JWT Error:", error);
    redirect("https://lakika.vercel.app");
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    // Mise à jour du mot de passe dans la base de données
    await prisma.user.update({
      where: { id: id },
      data: { password: hashedPassword },
    });

    return new NextResponse(
      JSON.stringify("mot de passe modifié avec succès"),
      {
        status: 200,
        message: "mot de passe modifié avec succès",
      }
    );
  } catch (error) {
    console.log("error:", error);
    return new NextResponse(
      "erreur du serveur dans la fonction reset password",
      {
        status: 500,
      }
    );
  }
};
