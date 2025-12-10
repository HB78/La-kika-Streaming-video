import Navbar from "../../component/Navbar";
import ListOfEpisode from "./../../component/ListOfEpisode";

export default async function Home({ params, searchParams }) {
  const id = params.id;
  const episodeId = searchParams?.id;

  const response = await fetch(
    `${process.env.NEXTAUTH_URL}/api/episode/${id}`,
    {
      next: {
        tags: ["fetchEpisodes"],
        revalidate: 60,
      },
    },
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Response error");
  }

  const responseData = await response.json();
  console.log("responseData:", responseData);

  // Trier les épisodes par date de création (comme dans ListOfEpisode)
  const sortedEpisodes = responseData?.episodeOwned
    ? [...responseData.episodeOwned].sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      })
    : [];

  // Trouver l'index de l'épisode actuel
  let currentEpisodeNumber = 1;
  if (episodeId && sortedEpisodes.length > 0) {
    const currentIndex = sortedEpisodes.findIndex((ep) => ep.id === episodeId);
    if (currentIndex !== -1) {
      currentEpisodeNumber = currentIndex + 1;
    }
  }

  return (
    <main
      role="main"
      aria-label={`Page d'accueil pour la série ${responseData?.title}`}
      className="w-full h-screen "
    >
      <Navbar position="relative" />
      <div className="text-center pb-12 pt-12 lg:pb-12 lg:pt-0">
        <h1
          role="heading"
          aria-level="1"
          className="text-2xl text-white font-bold"
        >
          {responseData?.title}
        </h1>
        {sortedEpisodes.length > 0 && (
          <h2 className="text-lg text-gray-400 font-medium mt-2">
            Épisode {currentEpisodeNumber} sur {sortedEpisodes.length}
          </h2>
        )}
      </div>

      <ListOfEpisode data={responseData} />
    </main>
  );
}
