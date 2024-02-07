"use client";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import Movie from "./Movie";

const Row = ({ title, moviesFetched, rowID }) => {
  //scroll behaviour
  const slideLeft = () => {
    const slider = document.getElementById("slider" + rowID);
    slider.scrollLeft = slider.scrollLeft - 500;
  };
  const slideRight = () => {
    const slider = document.getElementById("slider" + rowID);
    slider.scrollLeft = slider.scrollLeft + 500;
  };

  return (
    <section>
      <h2 className="text-white font-bold md:text-xl p-4">{title}</h2>
      <div className="relative flex items-center">
        <FaAngleLeft
          onClick={slideLeft}
          className="bg-white left-0 rounded-full absolute opacity-20 hover:opacity-100 cursor-pointer z-10"
          size={30}
          aria-label="Slide Left"
        />
        <div
          id={"slider" + rowID}
          className="w-full h-full overflow-x-scroll whitespace-nowrap scroll-smooth scrollbar-hide group-hover:block relative"
        >
          {moviesFetched?.map((item, index) => {
            return <Movie key={index} item={item} />;
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
