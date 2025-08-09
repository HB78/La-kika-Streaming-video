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
          alt={`Affiche du film ${randomMovie?.title}`} // Plus descriptif
          priority={true}
          quality={70} // Votre 70 est très bien
          sizes="(max-width: 768px) 100vw, (max-width: 2424px) 100%"
          fill={true}
          src={`https://image.tmdb.org/t/p/w1280/${randomMovie?.backdrop_path}`}
          className="w-full h-full object-cover lg:object-contain"
          placeholder="blur" // Optionnel mais sympa
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAADAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAbEAADAAMBAQAAAAAAAAAAAAABAgMABAURUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAFxEAAwEAAAAAAAAAAAAAAAAAAAECEf/aAAwDAQACEQMRAD8Anz9voy1dCI2mectSE5ioFCqia+KCwJ8HzGMZPqJb1oPEf//Z" // Optionnel
        />
      </div>

      <div className="absolute w-full top-[20%] p-4 md:p-8">
        <h1 className="text-3xl md:text-5xl font-bold">{randomMovie?.title}</h1>
        <div className="my-4">
          <button
            aria-label="Play Movie"
            className="border bg-red-600 hover:bg-red-700 text-white border-red-600 py-2 px-5 rounded transition-colors"
          >
            Play
          </button>
          <button
            aria-label="Add to Watch Later"
            className="border text-white border-gray-300 bg-transparent py-2 px-5 ml-4"
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
