import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "./../api/auth/[...nextauth]/route";

export const metadata = {
  title: "Creation de film",
  description: "Page de création de film pour les administrateurs",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (session?.user?.isAdmin === false || !session) {
    //J'ai opté pour la redirction mais j'aurais pu aussi afficher un message d'erreur dans une div que j'a
    redirect("/");
  }

  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
