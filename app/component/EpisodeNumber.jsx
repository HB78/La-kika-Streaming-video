"use client";
import { useSearchParams } from "next/navigation";

const EpisodeNumber = ({ sortedEpisodes }) => {
  const searchParams = useSearchParams();
  const episodeId = searchParams.get("id");

  // Trouver l'index de l'épisode actuel
  let currentEpisodeNumber = 1;
  if (episodeId && sortedEpisodes.length > 0) {
    const currentIndex = sortedEpisodes.findIndex(
      (ep) => ep.id.toString() === episodeId
    );
    if (currentIndex !== -1) {
      currentEpisodeNumber = currentIndex + 1;
    }
  }

  if (sortedEpisodes.length === 0) {
    return null;
  }

  return (
    <h2 className="text-lg text-gray-400 font-medium mt-2">
      Épisode {currentEpisodeNumber} sur {sortedEpisodes.length}
    </h2>
  );
};

export default EpisodeNumber;
