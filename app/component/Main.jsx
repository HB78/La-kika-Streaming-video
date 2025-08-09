import { Calendar, Info, Play, Plus, Star } from "lucide-react";
import Image from "next/image";

const Main = ({ movies = [] }) => {
  const randomMovie =
    movies.length > 0
      ? movies[Math.floor(Math.random() * movies.length)]
      : null;

  const truncateString = (str, num) => {
    if (str?.length > num) {
      return str.slice(0, num) + "...";
    }
    return str;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const getRatingColor = (rating) => {
    if (rating >= 7) return "text-green-400";
    if (rating >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  if (!randomMovie) {
    return (
      <header className="w-full h-[550px] lg:h-[650px] bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Aucun film disponible</div>
      </header>
    );
  }

  // Optimisation: Utiliser w1280 au lieu de original pour réduire le poids
  // original = ~3-5MB, w1280 = ~200-400KB
  // le seul changement du composant est ici le reste est cosmétic
  const imageUrl = `https://image.tmdb.org/t/p/w1280/${randomMovie.backdrop_path}`;

  return (
    <header className="relative w-full h-[550px] lg:h-[650px] overflow-hidden bg-black">
      {/* Image de fond optimisée */}
      <div className="absolute inset-0">
        <Image
          alt={`Affiche du film ${randomMovie.title}`}
          src={imageUrl}
          fill
          priority
          quality={75}
          sizes="(max-width: 640px) 640px, (max-width: 1280px) 1280px, 1920px"
          className="object-cover"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAADAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAbEAADAAMBAQAAAAAAAAAAAAABAgMABAURUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAFxEAAwEAAAAAAAAAAAAAAAAAAAECEf/aAAwDAQACEQMRAD8Anz9voy1dCI2mectSE5ioFCqia+KCwJ8HzGMZPqJb1oPEf//Z"
          loading="eager"
          fetchPriority="high"
        />

        {/* Overlays pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
      </div>

      {/* Préconnexion aux domaines TMDB */}
      <link rel="preconnect" href="https://image.tmdb.org" />
      <link rel="dns-prefetch" href="https://image.tmdb.org" />

      {/* Contenu avec loading="eager" pour le texte critique */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10 lg:p-16 max-w-7xl">
        <div className="space-y-6">
          {/* Badge de nouveauté */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-full uppercase tracking-wider">
              Nouveau
            </span>
            {randomMovie.vote_average && (
              <div className="flex items-center gap-1">
                <Star
                  className={`w-5 h-5 fill-current ${getRatingColor(randomMovie.vote_average)}`}
                />
                <span
                  className={`font-bold ${getRatingColor(randomMovie.vote_average)}`}
                >
                  {randomMovie.vote_average.toFixed(1)}
                </span>
                <span className="text-gray-400 text-sm">/10</span>
              </div>
            )}
          </div>

          {/* Titre - Element critique pour le FCP */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white max-w-4xl leading-tight">
            {randomMovie.title}
          </h1>

          {/* Métadonnées */}
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(randomMovie.release_date)}</span>
            </div>
            {randomMovie.adult && (
              <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">
                18+
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-200 text-base md:text-lg max-w-2xl leading-relaxed">
            {truncateString(randomMovie.overview, 200)}
          </p>

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="group flex items-center gap-3 px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer will-change-transform">
              <Play className="w-5 h-5" fill="currentColor" />
              <span>Lecture</span>
            </div>

            <div className="group flex items-center gap-3 px-8 py-3 bg-gray-800/80 backdrop-blur-sm text-white font-semibold rounded-lg border border-gray-600 hover:bg-gray-700/80 transform hover:scale-105 transition-all duration-200 cursor-pointer will-change-transform">
              <Plus className="w-5 h-5" />
              <span>Ma liste</span>
            </div>

            <div className="group flex items-center gap-2 px-6 py-3 bg-transparent text-gray-300 font-semibold rounded-lg border border-gray-600 hover:border-gray-400 hover:text-white transition-all duration-200 cursor-pointer">
              <Info className="w-5 h-5" />
              <span className="hidden sm:inline">Plus d'infos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateur de défilement */}
    </header>
  );
};

export default Main;
