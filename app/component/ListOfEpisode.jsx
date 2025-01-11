import Link from "next/link";
import VideoPlayerForSerie from "./VideoPlayerForSerie";

const ListOfEpisode = ({ data }) => {
  //dans le link je choisis de passer la data en la mettant dans le query cad dans l'url
  //j'aurais pu aussi la passer en la mettant dans un useState puis passer le state dynamique en props mais il aurait fallu que je passe par un useEffect pour que le state soit dynamique et cela aurait été plus compliqué mais surtout il aurait fallu transformer le composant en client component.
  // "sm:flex sm:flex-col sm:items-center gap-6 lg:justify-around lg:flex lg:flex-row lg:items-center"

  //on trie les épisodes par date de création
  const sortedEpisodes = data.episodeOwned.sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  return (
    <section className="flex items-center justify-around gap-6 max-lg:flex-row max-md:flex-col">
      <div className="flex lg:max-w-[300px] lg:h-[250px] lg:overflow-y-scroll overflow-x-scroll overflow-y-hidden w-full lg:flex-col text-white text-3xl whitespace-nowrap scroll-smooth scrollbar-hide cursor-pointer group-hover:inline p-3 shadow-lg shadow-red-500/50">
        {sortedEpisodes.map((item, index) => {
          return (
            <aside key={index} role="listitem">
              <Link
                href={{
                  pathname: `/serie/${data.id}`,
                  query: {
                    id: item.id,
                    url: item.url,
                  },
                }}
              >
                <span className="hover:text-red-600">{item.title}&nbsp;</span>
              </Link>
            </aside>
          );
        })}
      </div>
      <article
        role="region"
        aria-label={`Lecture de l'épisode 1`}
        className="flex items-center justify-center"
      >
        <VideoPlayerForSerie episodeOne={data.episodeOwned[0].url} />
      </article>
    </section>
  );
};

export default ListOfEpisode;
