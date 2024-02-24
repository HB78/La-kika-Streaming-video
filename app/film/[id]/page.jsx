import VideoPlayer from "@/app/component/VideoPlayer";
import Navbar from "../../component/Navbar";

export default async function Home({ params }) {
  const id = params.id;
  const response = await fetch(
    `${process.env.NEXTAUTH_URL}/api/video/${id}`,
    {
      revalidate: 60,
      tags: ["fetchEOneFilm"],
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

  if (
    !responseData?.url ||
    !responseData ||
    responseData?.url === "" ||
    responseData?.url === null
  ) {
    return <h1 className="text-3xl text-red-800 font-bolder">chargement..</h1>;
  }

  return (
    <>
      <main className="w-full h-screen ">
        <Navbar position="relative" />
        <h1 className="text-center text-2xl text-white font-bold pb-12 pt-12 lg:pb-12 lg:pt-0">
          {responseData.title}
        </h1>
        <article className="flex justify-center items-center">
          <VideoPlayer url={responseData?.url} />
        </article>
      </main>
    </>
  );
}
