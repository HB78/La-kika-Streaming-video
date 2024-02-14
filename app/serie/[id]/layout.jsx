export const metadata = {
  title: "Votre serie en cours",
  description: "Page d'accueil pour la série en cours de visionnage",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
