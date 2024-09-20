import Navbar from "../../component/Navbar";
import ListOfEpisode from "./../../component/ListOfEpisode";

export default async function Home({ params }) {
  const id = params.id;
  const response = await fetch(
    `${process.env.NEXTAUTH_URL}/api/episode/${id}`,
    {
      next: {
        tags: ["fetchEpisodes"],
        revalidate: 6,
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
  return (
    <main
      role="main"
      aria-label={`Page d'accueil pour la série ${responseData?.title}`}
      className="w-full h-screen "
    >
      <Navbar position="relative" />
      <h1
        role="heading"
        aria-level="1"
        className="text-center text-2xl text-white font-bold pb-12 pt-12 lg:pb-12 lg:pt-0"
      >
        {responseData.title}
      </h1>

      <ListOfEpisode data={responseData} />
    </main>
  );
}
