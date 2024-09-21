"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

const VideoPlayerForSerie = ({ episodeOne }) => {
  // je mets l'épisode 1 dans l'url pour que le player ne soit pas vide
  const [client, setClient] = useState(false);
  const [url, setUrl] = useState(episodeOne);
  const urlParams = useSearchParams();
  const dynamicUrl = urlParams.get("url");

  // --> coté client pour recuperer les données du query on utilise { useSearchParams }
  // --> coté server on utilise la props searchParams dans la zone argument du composant

  //j'ai utilisé le useEffect pour obligé le player a se lancer coté client a chaque fois que la page est chargé car dans le cas contraire cela crée des problèmes liés à l'hydratation.

  //--> je vais utiliser le useEffect pour surveiller le changement de la props searchParams et ainsi mettre à jour le state url. A chaque fois que le state url change le player se met à jour.

  useEffect(() => {
    // Mise à jour l'URL dans l'état lorsque l'URL dynamique change
    if (dynamicUrl) {
      setUrl(dynamicUrl);
    }
    // Mise à jour l'état client à true
    setClient(true);
  }, [dynamicUrl]);
  return (
    <>
      {client ? (
        <ReactPlayer
          width={"100%"}
          url={url}
          controls={true}
          // light is useful in case of dark mode
          // light={true}
          // picture in picture
          pip={true}
          loop={true}
          playing={true}

          // onEnded={() => console.log("Lecture terminée")}
        />
      ) : null}
    </>
  );
};

export default VideoPlayerForSerie;
