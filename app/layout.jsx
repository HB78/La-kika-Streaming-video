import "@uploadthing/react/styles.css";
import { Inter } from "next/font/google";
import Favicon from "../public/k.jpg";
import Provider from "./context/provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title:
    "La kika est le premier site de streaming en ligne sans pub et sans inscription",
  description:
    "Regardez vos films et séries préférés en ligne sans pub et sans inscription, le site est totalement gratuit et sans pub. Ne payez plus pour regarder vos films et séries, profitez sans limite de notre catalogue de films et séries en streaming.",
  icons: [{ rel: "icon", url: Favicon.src }],
  openGraph: {
    title:
      "la kika - Le premier site de streaming sans pub et sans inscription",
    description:
      "Regardez vos films et séries préférés en ligne sans pub et sans inscription, le site est totalement gratuit et sans pub. Ne payez plus pour regarder vos films et séries, profitez sans limite de notre catalogue de films et séries en streaming.",
    // url: 'https://nextjs.org',
    // siteName: 'Next.js',
    locale: "en_FR",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <Provider>
        <body>{children}</body>
      </Provider>
    </html>
  );
}
// https://nextjs.org/docs/app/api-reference/functions/generate-metadata
