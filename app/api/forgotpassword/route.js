import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
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

  const token = jwt.sign(
    {
      id: findUserIfExist.id,
      email: findUserIfExist.email,
    },
    process.env.JWT_SECRET_LOST_PASSWORD,
    { expiresIn: "10m" }
  );

  const link = `https://lakika.vercel.app/reset-password/${findUserIfExist.id}/${token}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de votre mot de passe</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .email-container {
            background-color: #ffffff;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .header {
            font-size: 20px;
            color: #333333;
        }
        .content {
            margin-top: 20px;
            font-size: 16px;
            color: #666666;
        }
        .button {
            display: block;
            width: max-content;
            background-color: #0056b3;
            color: #ffffff;
            padding: 10px 20px;
            margin-top: 20px;
            text-decoration: none;
            border-radius: 5px;
            text-align: center;
            font-size: 20px;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777777;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <h1 class="header">Réinitialisation de votre mot de passe sur LaKika</h1>
        <p class="content">
            Vous recevez cet email car nous avons reçu une demande de réinitialisation du mot de passe pour votre compte. Veuillez cliquer sur le bouton ci-dessous pour réinitialiser votre mot de passe.
        </p>
        <a href="${link}" class="button">Réinitialiser mon mot de passe</a>
        <p class="footer">
            Si vous n'avez pas demandé de réinitialisation, veuillez ignorer cet email ou nous prévenir. Ce lien de réinitialisation expirera dans 10 minutes.
        </p>
    </div>
</body>
</html>
`;

  try {
    const data = await resend.emails.send({
      from: "hiko@lakka.blue",
      to: email,
      subject: "Forgot Password Lakika website",
      html: htmlContent,
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
