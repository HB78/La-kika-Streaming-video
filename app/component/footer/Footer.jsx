import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  const linkStyle =
    "rounded px-1 py-1 text-sm text-slate-300 transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

  return (
    <footer className="mt-12 w-full border-t border-white/10 bg-black">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 md:flex-row md:justify-between">
        <nav aria-label="Navigation du pied de page">
          <ul className="flex items-center gap-6">
            <li>
              <Link href="/" className={linkStyle}>
                Accueil
              </Link>
            </li>

            <li>
              <Link href="/contact" className={linkStyle}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        <small className="text-center text-sm text-slate-300 md:text-right">
          Données fournies par{" "}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="The Movie Database (ouvre dans un nouvel onglet)"
            className={linkStyle}
          >
            TMDB
            <span className="sr-only"> (ouvre dans un nouvel onglet)</span>
          </a>
          <span aria-hidden="true"> · </span>
          Ce site n&apos;est ni approuvé ni certifié par TMDB
          <span aria-hidden="true"> · </span>© {year}
        </small>
      </div>
    </footer>
  );
}
