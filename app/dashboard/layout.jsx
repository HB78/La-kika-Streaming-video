import prisma from "@/lib/singleton/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const metadata = {
  title: "Dashboard",
  description: "Dasboard de managment du site",
};

export default async function RootLayout({ children }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      redirect("/");
    }

    // Vérification en base de données d'abord
    const checkIfUserIsAdmin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });

    // verfie si checkIfUserIsAdmin undefined ou null
    //verifie si checkIfUserIsAdmin.isAdmin est false ou true ou undefined ou null
    //necessite ? et !
    if (!checkIfUserIsAdmin || checkIfUserIsAdmin?.isAdmin === false) {
      redirect("/");
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Error in movie layout:", error);
    redirect("/");
  }
}
