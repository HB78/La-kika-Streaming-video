"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import UploadVideo from "../UploadVideo";

const CreateEpisodeForm = () => {
  const [Video, setVideo] = useState("");
  console.log("Video:", Video);

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
    setVideo((prevPhotoUrl) => {
      console.log("--> LA videoUrl", prevPhotoUrl);
      return data.url;
    });
  }

  const onSubmit = async (data) => {
    const res = await fetch(
      `https://lakika.vercel.app/api/episode/${data.title}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.episode,
          url: Video,
        }),
        // body: JSON.stringify({ ...data, photo: photoUrl }),
      }
    );
    if (res.ok) {
      alert("episode added successfully");
    } else {
      alert("error");
    }
  };

  return (
    <section className="max-w-[320px] mx-auto py-3">
      <h1 className="text-2xl font-bold">Add an episode</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full h-auto flex flex-col py-4"
      >
        <input
          className="p-3 my-2 bg-gray-700 rounded focus:border-red-500 focus:outline-none focus:border"
          type="text"
          placeholder="Nom de la série"
          id="title"
          {...register("title")}
        />
        <small>{errors.title?.message}</small>
        <input
          className="p-3 my-2 bg-gray-700 rounded focus:border-red-500 focus:outline-none focus:border"
          type="text"
          placeholder="Numéro de l'épisode"
          id="episode"
          {...register("episode")}
        />
        <small>{errors.episode?.message}</small>
        <input
          type="submit"
          className="bg-red-600 py-3 my-6 rounded font-bold cursor-pointer hover:bg-red-700"
          name="Add an episode"
        />
        <div className="flex flex-col gap-3">
          <UploadVideo getInfo={getVideoUrl} />
        </div>
        <nav className="w-full text-md flex justify-between">
          <Link href={"/movie/newserie"} className="w-full">
            create a serie
          </Link>
          <Link href={"/movie/newepisode"} className="w-full">
            new episode
          </Link>
          <Link href={"/movie"} className="w-full">
            create a movie
          </Link>
        </nav>
        <Link
          href={"/"}
          className="bg-red-600 py-3 my-6 rounded-full text-md text-center"
        >
          Return to website
        </Link>
      </form>
    </section>
  );
};

export default CreateEpisodeForm;
