import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  const linkStyle =
    "text-sm text-slate-400 transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded";

  return (
    <footer className="mt-12 w-full border-t border-white/10 bg-black">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 md:flex-row md:justify-between">
        {/* Navigation */}
        <nav aria-label="Pied de page" className="flex items-center gap-6">
          <Link className={linkStyle} href="/">
            Accueil
          </Link>
          <Link className={linkStyle} href="/contact">
            Contact
          </Link>
        </nav>

        {/* Attribution TMDB : requise par leurs conditions d'utilisation */}
        <p className="text-xs text-slate-500 text-center md:text-right">
          Données fournies par{" "}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded"
          >
            TMDB
          </a>{" "}
          · Ce site n&apos;est ni approuvé ni certifié par TMDB
          <span className="mx-2 hidden md:inline" aria-hidden="true">
            ·
          </span>
          <span className="block md:inline">© {year}</span>
        </p>
      </div>
    </footer>
  );
}
