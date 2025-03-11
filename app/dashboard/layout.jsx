import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const metadata = {
  title: "Dashboard",
  description: "Dasboard de managment du site",
};

const prisma = new PrismaClient();

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (session?.user?.isAdmin === false || !session) {
    //J'ai opté pour la redirction mais j'aurais pu aussi afficher un message d'erreur dans une div que j'a
    redirect("/");
  }

  // Double vérification en base de données
  const checkIfUserIsAdmin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true }, // Optimisation: ne récupérer que ce dont on a besoin
  });

  if (!checkIfUserIsAdmin || checkIfUserIsAdmin.isAdmin === false) {
    redirect("/");
  }

  return <div>{children}</div>;
}
