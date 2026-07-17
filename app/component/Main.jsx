import Image from "next/image";

/**
 * Héros « À la une ».
 *
 * Sélection DÉTERMINISTE du film (seed = jour de l'année) :
 * - même choix côté serveur et client → zéro risque d'erreur d'hydratation
 * - stable entre les re-renders → l'image ne change pas sous les yeux de l'utilisateur
 * - compatible avec le cache/SSG, et le film change chaque jour
 * (pour revenir à un choix aléatoire par visite, il faudrait faire le tirage
 *  dans un vrai contexte serveur — page dynamique — jamais dans le rendu)
 */
const Main = ({ movies }) => {
  // Garde-fou : pas de crash si la liste est vide ou absente
  if (!movies?.length) return null;

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86_400_000,
  );
  const movie = movies[dayOfYear % movies.length];

  // Date formatée en français : "12 mai 2024" au lieu de "2024-05-12"
  const releaseDate = movie?.release_date
    ? new Date(movie.release_date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    /* Conteneur en RATIO et non en hauteur fixe : le cadre reste proche
       du format 16:9 des backdrops → object-cover n'a presque rien à rogner,
       fini l'effet "image trop zoomée" sur mobile.
       min-h garantit la place du texte, max-h borne les écrans géants */
    <header className="relative w-full aspect-[4/3] min-h-[420px] sm:aspect-video lg:aspect-[21/9] lg:max-h-[580px] text-white">
      {/* Image de fond */}
      <Image
        /* Le h1 annonce déjà le titre : une alt vide évite la double
           annonce aux lecteurs d'écran (l'image est ici décorative) */
        alt=""
        priority
        quality={70}
        sizes="100vw"
        fill
        src={`https://image.tmdb.org/t/p/w1280${movie?.backdrop_path}`}
        className="object-cover object-[center_25%]"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAADAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAbEAADAAMBAQAAAAAAAAAAAAABAgMABAURUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAFxEAAwEAAAAAAAAAAAAAAAAAAAECEf/aAAwDAQACEQMRAD8Anz9voy1dCI2mectSE5ioFCqia+KCwJ8HzGMZPqJb1oPEf//Z"
      />

      {/* Scrim de lisibilité : dégradé latéral côté texte + fondu bas
          qui raccorde le héros au fond de la page */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent"
      />

      {/* Contenu : ancré en bas à gauche, zone naturelle de lecture */}
      <div className="absolute inset-x-0 bottom-0 p-4 pb-10 md:p-8 md:pb-14">
        <div className="max-w-2xl">
          {releaseDate && (
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-red-500 md:text-sm">
              Sortie le {releaseDate}
            </p>
          )}

          <h1
            className="text-3xl font-bold leading-tight md:text-5xl"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
          >
            {movie?.title}
          </h1>

          {/* line-clamp : coupe proprement en fin de ligne, 3 lignes max,
              s'adapte à toutes les largeurs (fini la coupe à 150 caractères
              en plein milieu d'un mot) */}
          {movie?.overview && (
            <p className="mt-3 line-clamp-3 max-w-xl text-sm text-gray-200 md:text-base">
              {movie.overview}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded bg-red-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <span aria-hidden="true">▶</span>
              Lecture
            </button>
            <button
              type="button"
              className="rounded border border-white/40 bg-black/30 px-6 py-2.5 font-semibold text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              + Ma liste
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Main;
