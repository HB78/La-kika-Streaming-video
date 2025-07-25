import { redirect } from "next/navigation";

export const metadata = {
  title: "Creation de films",
  description: "Page de création de films pour les administrateurs",
};

// Sans singleton : À chaque client qui arrive, on ouvre un nouveau restaurant (inefficace)
// Avec singleton : On a un seul restaurant qui sert tous les clients (efficace)

export default async function RootLayout({ children }) {
  try {
    // Vérification si l'utilisateur est admin
    const adminCheck = await isAdmin();

    // Vérifier si c'est une erreur
    if (adminCheck.status !== 200) {
      redirect("/");
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Error in movie layout:", error);
    redirect("/");
  }
}
