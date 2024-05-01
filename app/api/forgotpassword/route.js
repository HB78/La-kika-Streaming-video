import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { Resend } from "resend";
const prisma = new PrismaClient();

function validateEmail(email) {
  var re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
const resend = new Resend(process.env.RESEND_API_KEY);

export const POST = async (req) => {
  let body = await req.json();

  const { email } = body;

  if (!email) {
    return new NextResponse("remplissez le champs email", { status: 400 });
  }

  const findUserIfExist = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  if (!findUserIfExist) {
    return new NextResponse(JSON.stringify("email inexistant"), {
      status: 400,
    });
  }

  if (!validateEmail(email) || email.length > 70) {
    return new NextResponse(JSON.stringify("L'email n'est pas correct"), {
      status: 400,
    });
  }

  try {
    const data = await resend.emails.send({
      from: "hiko@lakka.blue",
      to: email,
      subject: "Forgot Password Lakika website",
      html: `<strong>it works ${findUserIfExist.name} !</strong>`,
    });

    const emailSendedStringified = JSON.stringify(data);

    return new NextResponse(emailSendedStringified, {
      status: 200,
      message: "Message envoyé",
    });
  } catch (error) {
    console.log("error:", error);
    return new NextResponse(
      "erreur du serveur dans la fonction forgot password",
      {
        status: 500,
      }
    );
  }
};
