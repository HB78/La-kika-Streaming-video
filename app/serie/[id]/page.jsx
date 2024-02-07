import ListOfEpisode from "@/app/component/ListOfEpisode";
import { Suspense } from "react";
import Navbar from "../../component/Navbar";

export default async function Home({ params }) {
  const id = params.id;
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/episode/${id}`,
    {
      revalidate: 60,
      tags: ["fetchEpisode"],
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
    <>
      <Navbar position="relative" />
      <main
        role="main"
        aria-label={`Page d'accueil pour la série ${responseData?.title}`}
        className="w-full h-screen "
      >
        <h1
          role="heading"
          aria-level="1"
          className="text-center text-2xl text-white font-bold pb-12 pt-12 lg:pb-12 lg:pt-0"
        >
          {responseData.title}
        </h1>
        <Suspense
          fallback={<div className="text-xl text-red-700">Loading...</div>}
        >
          <ListOfEpisode data={responseData} />
        </Suspense>
      </main>
    </>
  );
}
