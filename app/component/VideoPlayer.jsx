"use client";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

const VideoPlayer = ({ url }) => {
  //j'ai utilisé le useEffect pour obligé le player a se lancer coté client a chaque fois que la page est chargé car dans le cas contraire cela crée des problèmes liés à l'hydratation.
  const [client, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
  }, []);

  if (!client || !url)
    return <h1 className="text-2xl text-red-600">Chargement</h1>;

  return (
    <>
      {client ? (
        <ReactPlayer
          className="w-full h-full"
          url={url}
          controls={true}
          // light is useful in case of dark mode
          // light={true}
          // picture in picture
          pip={true}
          loop={true}

          // onEnded={() => console.log("Lecture terminée")}
        />
      ) : null}
    </>
  );
};

export default VideoPlayer;
