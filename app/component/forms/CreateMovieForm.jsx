"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { DropZone } from "../dropzones/DropZone";
import { DropZoneVideo } from "../dropzones/DropZoneVideo";

const CreateMovieForm = () => {
  const [photoUrl, setPhotoUrl] = useState("");
  const [Video, setPhotoVideo] = useState("");
  //on créer le schéma de verification des input avec yup
  const schema = yup.object().shape({
    title: yup.string("entrez un nom valide").required("remplissez le champs"),
  });
  //on créer les constante de validation des input avec react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  function getInfo(info) {
    let data = info;
    setPhotoUrl((prevPhotoUrl) => {
      console.log("--> LA photoUrl", prevPhotoUrl);
      return data.url;
    });
  }

  function getVideoUrl(infoData) {
    let data = infoData;
    setPhotoVideo((prevPhotoUrl) => {
      console.log("--> LA videoUrl", prevPhotoUrl);
      return data.url;
    });
  }

  const onSubmit = async (data) => {
    const res = await fetch(`https://lakika.vercel.app/api/video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: data.title,
        photo: photoUrl,
        url: Video,
      }),
      // body: JSON.stringify({ ...data, photo: photoUrl }),
    });
    if (res.ok) {
      alert("movie created");
    } else {
      console.log("error:", res.json());
      alert("error");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Champ titre */}
        <div className="space-y-2">
          <input
            className="w-full p-3 bg-netflix-dark border border-netflix-red/20 rounded-lg focus:ring-2 focus:ring-netflix-red focus:border-netflix-red focus:outline-none transition-all"
            type="text"
            placeholder="Entrez le titre du film"
            id="title"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-netflix-red text-sm">{errors.title.message}</p>
          )}
        </div>

        {/* Zones de dépôt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Image de couverture
            </label>
            <DropZone getInfo={getInfo} />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Vidéo du film
            </label>
            <DropZoneVideo getInfo={getVideoUrl} />
          </div>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          className="w-full bg-netflix-red hover:bg-netflix-red/90 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02]"
        >
          Ajouter le film
        </button>
      </form>

      {/* Navigation */}
      <div className="pt-6 border-t border-netflix-red/20">
        <div className="grid grid-cols-3 gap-4">
          <Link
            href="/movie/newserie"
            className="text-center text-white py-2 px-4 bg-red-400 hover:bg-red-500 border border-netflix-red/20 rounded-lg transition-colors duration-200 text-sm"
          >
            Créer une série
          </Link>
          <Link
            href="/movie/newepisode"
            className="text-center text-white py-2 px-4 bg-red-400 hover:bg-red-500 border border-netflix-red/20 rounded-lg transition-colors duration-200 text-sm"
          >
            Nouvel épisode
          </Link>
          <Link
            href="/movie"
            className="text-center text-white py-2 px-4 bg-red-400 hover:bg-red-500 border border-netflix-red/20 rounded-lg transition-colors duration-200 text-sm"
          >
            Créer un film
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreateMovieForm;
