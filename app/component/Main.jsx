/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import Image from "next/image";

const Main = ({ movies }) => {
  const randomMovie = movies[Math.floor(Math.random() * movies.length)];

  //Pour couper le texte quand il est trop grand
  const truncateString = (str, num) => {
    if (str?.length > num) {
      return str.slice(0, num) + "...";
    } else {
      return str;
    }
  };

  return (
    <header className="w-full h-[550px] text-white lg:h-[580px]">
      <div className="w-full h-full relative">
        <Image
          alt="affiche de film parmis les plus populaires"
          priority={true}
          quality={100}
          sizes="(max-width: 768px) 100vw, (max-width: 1424px) 100%"
          fill={true}
          src={`https://image.tmdb.org/t/p/original/${randomMovie?.backdrop_path}`}
          className="w-full h-full object-cover lg:object-contain"
        />
      </div>

      <div className="absolute w-full top-[20%] p-4 md:p-8">
        <h1 className="text-3xl md:text-5xl font-bold">{randomMovie?.title}</h1>
        <div className="my-4">
          <button
            aria-label="Play Movie"
            className="border bg-gray-300 text-black border-gray-300 py-2 px-5"
          >
            Play
          </button>
          <button
            aria-label="Add to Watch Later"
            className="border text-white border-gray-300 py-2 px-5 ml-4"
          >
            Watch Later
          </button>
        </div>
        <p className="tex-gray-400 text-sm">
          Release : {randomMovie?.release_date}
        </p>
        <p className="w-full md:max-w-[70%] lg:max-w-[50%] xl:max-w-[35%] text-gray-200">
          {" "}
          {truncateString(randomMovie?.overview, 150)}
        </p>
      </div>
    </header>
  );
};

export default Main;
