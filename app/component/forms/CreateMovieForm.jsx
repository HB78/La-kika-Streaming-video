"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import UploadImage from "../UploadImage";
import UploadVideo from "../UploadVideo";

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
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/video`, {
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
    <div className="max-w-[320px] mx-auto py-10">
      <h1 className="text-3xl font-bold">Add a movie</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full h-auto flex flex-col py-4"
      >
        <input
          className="p-3 my-2 bg-gray-700 rounded focus:border-red-500 focus:outline-none focus:border"
          type="text"
          placeholder="Nom du film"
          id="title"
          {...register("title")}
        />
        <small>{errors.title?.message}</small>
        <input
          type="submit"
          aria-label="Ajouter un film"
          className="bg-red-600 py-3 my-6 rounded font-bold"
          name="Add a movie"
        />
        <div className="flex flex-col gap-3">
          <UploadImage getInfo={getInfo} />
          <UploadVideo getInfo={getVideoUrl} />
        </div>
      </form>
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
    </div>
  );
};

export default CreateMovieForm;
