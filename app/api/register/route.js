import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

function validateEmail(email) {
  var re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function validateName(name) {
  let regex = new RegExp("[a-zA-Z]");
  return regex.test(name);
}

export const POST = async (req) => {
  let body = await req.json();

  const { email, name, password } = body;

  if (!email || !name || !password) {
    return new NextResponse("remplissez les champs", { status: 400 });
  }

  const findUserIfExist = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  if (findUserIfExist) {
    return new NextResponse(JSON.stringify("user existant"), { status: 400 });
  }

  try {
    if (
      !validateEmail(email) ||
      password.length < 4 ||
      password.length > 80 ||
      email.length > 70
    ) {
      new NextResponse("L'email ou le mot de passe n'est pas correct", {
        status: 400,
      });
      return;
    }
    //si le user n'entre pas de nom valide
    if (!validateName(name)) {
      new NextResponse("il n'y a pas de lettre dans votre nom", {
        status: 400,
      });
      return;
    }

    //si le user n'entre pas de nom validen (longueur du nom)
    if (name.length > 25 || name.length < 2) {
      return new NextResponse(
        "La taille du nom doit etre comprise entre 2 et 25 caractères",
        {
          status: 400,
        }
      );
    }

    const hashPassword = bcrypt.hashSync(password, 10);
    const createUser = await prisma.user.create({
      data: {
        email: email,
        name: name,
        password: hashPassword,
      },
    });

    const userRegistered = JSON.stringify(createUser);

    return new NextResponse(userRegistered, {
      status: 201,
      message: "serie ajouté avec succes",
    });
  } catch (error) {
    console.log("error:", error);
    return new NextResponse("erreur du serveur dans la fonction create user", {
      status: 500,
    });
  }
};
