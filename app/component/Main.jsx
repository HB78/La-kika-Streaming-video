/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import Image from "next/image";

const Main = ({ movies }) => {
  // Utiliser un index fixe plutôt qu'aléatoire pour éviter l'hydratation incohérente
  const movieIndex = 0; // Toujours utiliser le premier film pour la cohérence
  const movie = movies[movieIndex];

  //Pour couper le texte quand il est trop grand
  const truncateString = (str, num) => {
    if (str?.length > num) {
      return str.slice(0, num) + "...";
    } else {
      return str;
    }
  };

  return (
    <header className="w-full h-[550px] text-white lg:h-[580px] relative">
      {/* Ajouter un overlay pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      <div className="w-full h-full relative">
        <Image
          alt={movie?.title || "Film en vedette"}
          priority={true}
          quality={70} // Réduire légèrement la qualité pour accélérer le chargement
          sizes="100vw" // Simplifier la directive sizes
          fill={true}
          src={`https://image.tmdb.org/t/p/original/${movie?.backdrop_path}`}
          className="w-full object-cover lg:object-contain"
        />
      </div>

      <div className="absolute w-full top-[20%] p-4 md:p-8 z-20">
        <h1 className="text-3xl md:text-5xl font-bold">{movie?.title}</h1>
        <div className="my-4">
          <button
            aria-label="Play Movie"
            className="border bg-red-600 hover:bg-red-700 text-white border-red-600 py-2 px-5 rounded transition-colors"
          >
            Play
          </button>
          <button
            aria-label="Add to Watch Later"
            className="border text-white border-gray-300 py-2 px-5 ml-4 rounded hover:bg-white/20 transition-colors"
          >
            Watch Later
          </button>
        </div>
        <p className="text-gray-400 text-sm">Release : {movie?.release_date}</p>
        <p className="w-full md:max-w-[70%] lg:max-w-[50%] xl:max-w-[35%] text-gray-200">
          {truncateString(movie?.overview, 150)}
        </p>
      </div>
    </header>
  );
};

export default Main;
