import prisma from "@/lib/singleton/prisma";
import DashboardComponent from "../component/dashboard/Dashboard";
import { fetchMovies } from "./../../fetches/fetches";

const Allepisodes = async () => {
  try {
    // Récupération des séries avec leurs épisodes
    const seriesWithEpisodes = await prisma.serie.findMany({
      include: {
        episodeOwned: true,
      },
    });

    return seriesWithEpisodes;
  } catch (error) {
    console.error("Erreur lors de la récupération des séries:", error);
    // En cas d'erreur, retourne un tableau vide plutôt qu'une erreur
    return [];
  }
};

export default async function Dashboard() {
  const responseDataMovies = await fetchMovies();
  const serieWithEpisodes = await Allepisodes();

  return (
    <DashboardComponent
      movies={responseDataMovies}
      tvShows={serieWithEpisodes}
    />
  );
}
