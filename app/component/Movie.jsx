/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import Image from "next/image";
import Link from "next/link";

const Movie = ({ item }) => {
  // const id = item?.backdrop_path ? item?.backdrop_path : item?.photo;
  const falseMovieId = `https://image.tmdb.org/t/p/w500/${item?.backdrop_path}`;
  const trueId = !item?.photo ? falseMovieId : item?.photo;
  const trueLink = !item?.genre ? "/" : `/${item.genre}/${item?.id}`;
  return (
    //quand les image viennent de la meme source ou la meme api exterieur on peut ne pas toucher a la hauteur de l'image et la laisser en auto

    <Link href={trueLink}>
      <article
        className="w-[180px]  md:w-[260px] lg:w-[300px]
    h-[160px]  md:h-[245px] lg:h-[200px] 
    inline-block cursor-pointer relative ml-3 transition-transform duration-300 hover:scale-105"
      >
        <Image
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 2424px) 100%"
          priority
          quality={70}
          className="w-full h-full block object-contain min-lg:object-cover"
          src={trueId}
          alt="image du film ou de la serie du site de streaming"
        />

        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-full h-full hover:bg-black/80 opacity-0 text-white hover:opacity-100"
        >
          <p className="text-center whitespace-normal text-sm md:text-sm font-bold flex justify-center items-center h-full">
            {item?.title}
          </p>
        </div>
      </article>
    </Link>
  );
};

export default Movie;
