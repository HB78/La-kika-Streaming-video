"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import InputSearch from "./InputSearch";
import Movie from "./Movie";

const Row = ({ title, moviesFetched, rowID }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Fonction de filtrage des films en fonction du terme de recherche
  //on met le useMemo pour ne pas recréer le tableau de filtre à chaque fois que le terme de recherche change et a cause de la fonction slideLeft et slideRight
  const filteredMovies = useMemo(() => {
    return moviesFetched.filter((movie) =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [moviesFetched, searchTerm]);

  //scroll behaviour car chaque clic lla fonction et recree on veut eviter cette erreur
  const sliderRef = useRef(null);

  const slideLeft = useCallback(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft -= 500;
    }
  }, []);

  const slideRight = useCallback(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft += 500;
    }
  }, []);

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-white font-bold md:text-xl p-4">{title}</h2>
        <InputSearch
          title={title}
          setSearchTerm={setSearchTerm}
          searchTerm={searchTerm}
        />
      </div>
      <div className="relative flex items-center">
        <FaAngleLeft
          onClick={slideLeft}
          className="bg-white left-0 rounded-full absolute opacity-20 hover:opacity-100 cursor-pointer z-10"
          size={30}
          aria-label="Slide Left"
        />
        <div
          id={"slider" + rowID}
          ref={sliderRef}
          className="flex gap-3 w-full h-full overflow-x-scroll whitespace-nowrap scroll-smooth scrollbar-hide group-hover:block relative"
        >
          {filteredMovies?.map((item) => {
            return <Movie key={item.id} item={item} />;
          })}
        </div>
        <FaAngleRight
          onClick={slideRight}
          className="bg-white right-0 rounded-full absolute opacity-20 hover:opacity-100 cursor-pointer z-10"
          size={30}
          aria-label="Slide Right"
        />
      </div>
    </section>
  );
};

export default Row;
