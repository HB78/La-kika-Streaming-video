import "@uploadthing/react/styles.css";
import Provider from "./context/provider";
import "./globals.css";

// export const metadata = {
//   metadataBase: new URL(`${process.env.NEXTAUTH_URL}`),
//   title:
//     "La kika est le premier site de streaming en ligne sans pub et sans inscription",
//   description:
//     "Regardez vos films et séries préférés en ligne sans pub et sans inscription, le site est totalement gratuit et sans pub. Ne payez plus pour regarder vos films et séries, profitez sans limite de notre catalogue de films et séries en streaming.",
//   icons: [{ rel: "icon", url: Favicon.src }],
//   openGraph: {
//     title:
//       "la kika - Le premier site de streaming sans pub et sans inscription",
//     description:
//       "Regardez vos films et séries préférés en ligne sans pub et sans inscription, le site est totalement gratuit et sans pub. Ne payez plus pour regarder vos films et séries, profitez sans limite de notre catalogue de films et séries en streaming.",
//     // url: 'https://nextjs.org',
//     // siteName: 'Next.js',
//     locale: "en_FR",
//     type: "website",
//   },
// };

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <Provider>
        <body>{children}</body>
      </Provider>
    </html>
  );
}
