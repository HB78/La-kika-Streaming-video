import EpisodeNumber from "../../component/EpisodeNumber";
import Navbar from "../../component/Navbar";
import ListOfEpisode from "./../../component/ListOfEpisode";

export default async function Home({ params, searchParams }) {
  const id = params.id;

  const response = await fetch(
    `${process.env.NEXTAUTH_URL}/api/episode/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        tags: ["fetchEpisodes"],
        revalidate: 60,
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
        <EpisodeNumber sortedEpisodes={sortedEpisodes} />
      </div>

      <ListOfEpisode data={responseData} />
    </main>
  );
}
