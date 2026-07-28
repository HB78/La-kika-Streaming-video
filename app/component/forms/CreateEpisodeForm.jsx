"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { DropZoneVideo } from "../dropzones/DropZoneVideo";

/**
 * Formulaire « Nouvel épisode » — habillage Cinématique.
 * La LOGIQUE est celle d'origine, inchangée :
 * - champ "title" = titre de la série (saisie libre) ;
 * - champ "episode" = titre/numéro de l'épisode ;
 * - POST sur /api/episode/[titre de la série] avec { title: episode, url: Video }.
 * Seul le UI a été retravaillé.
 */
const CreateEpisodeForm = () => {
  const [Video, setVideo] = useState("");

  //on créer le schéma de verification des input avec yup
  const schema = yup.object().shape({
    title: yup.string("entrez un nom valide").required("remplissez le champs"),
    episode: yup
      .string("entrez un nom valide")
      .required("remplissez le champs"),
  });

  //on créer les constante de validation des input avec react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Observés en direct pour l'aperçu du poster + la checklist (UI seulement)
  const title = watch("title");
  const episode = watch("episode");

  function getVideoUrl(infoData) {
    setVideo(infoData);
  }

  const onSubmit = async (data) => {
    if (!Video) {
      alert("Veuillez d'abord uploader une vidéo");
      return;
    }
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
      }
    );
    if (res.ok) {
      alert("episode added successfully");
    } else {
      alert("error");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] bg-gradient-to-b from-[#191818] to-netflix-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
      {/* ── Poster héros : placeholder + titre de l'épisode en direct ──────── */}
      <div className="relative min-h-[300px] lg:min-h-[470px] flex flex-col justify-end p-6 gap-2 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(11,11,11,0) 35%, rgba(11,11,11,0.9)), repeating-linear-gradient(115deg, #241111 0 14px, #1b0d0d 14px 28px)",
          }}
        />
        <span className="absolute top-5 left-6 z-10 text-[10px] font-mono tracking-[0.2em] text-white/40">
          APERÇU · ÉPISODE
        </span>
        <h2 className="relative z-10 font-bold text-3xl leading-[0.95] tracking-tight text-white uppercase break-words">
          {episode?.trim() || "Épisode"}
        </h2>
        <p className="relative z-10 font-mono text-[11px] tracking-widest text-netflix-gray">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-netflix-red mr-1.5 align-middle" />
          {title?.trim() ? title.toUpperCase() : "SÉRIE"} · APERÇU EN DIRECT
        </p>
      </div>

      {/* ── Formulaire ────────────────────────────────────────────────────── */}
      <div className="p-6 lg:p-8 flex flex-col gap-5">
        <div>
          {/* Logo cliquable → retour à l'accueil */}
          <Link
            href="/"
            className="inline-block font-extrabold text-xl tracking-tight text-netflix-red hover:text-netflix-red/80 transition-colors"
          >
            LA&nbsp;KIKA
          </Link>
          <span className="block font-mono text-[10.5px] tracking-[0.22em] uppercase text-netflix-gray mt-3">
            Nouveau contenu
          </span>
          <h1 className="font-bold text-4xl leading-[0.95] tracking-tight text-white uppercase mt-1.5">
            Nouvel épisode
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom de la série */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm text-netflix-light">
                Nom de la série
              </label>
              <input
                className="text-white w-full p-3 bg-netflix-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-netflix-red focus:border-netflix-red focus:outline-none transition-all"
                type="text"
                placeholder="Nom de la série"
                id="title"
                autoComplete="on"
                {...register("title")}
              />
              <small className="text-netflix-red">{errors.title?.message}</small>
            </div>

            {/* Numéro / titre de l'épisode */}
            <div className="space-y-2">
              <label htmlFor="episode" className="block text-sm text-netflix-light">
                Épisode
              </label>
              <input
                className="text-white w-full p-3 bg-netflix-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-netflix-red focus:border-netflix-red focus:outline-none transition-all"
                type="text"
                placeholder="Numéro de l'épisode"
                id="episode"
                {...register("episode")}
              />
              <small className="text-netflix-red">{errors.episode?.message}</small>
            </div>
          </div>

          {/* Vidéo de l'épisode */}
          <div className="space-y-2">
            <label className="block text-sm text-netflix-light">Vidéo</label>
            <DropZoneVideo getInfo={getVideoUrl} />
          </div>

          {/* Barre d'action : checklist (indicative) + bouton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-5 border-t border-white/10">
            <ul className="flex gap-5">
              <li className="flex items-center gap-2 text-sm text-netflix-gray">
                <span aria-hidden="true" className={Video ? "text-green-500" : "text-netflix-gray"}>
                  {Video ? "✓" : "○"}
                </span>
                {Video ? "Vidéo envoyée" : "Vidéo à envoyer"}
              </li>
            </ul>
            <button
              type="submit"
              className="bg-netflix-red hover:bg-netflix-red/90 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:scale-[1.02]"
            >
              Ajouter l&apos;épisode
            </button>
          </div>
        </form>

        {/* Navigation secondaire — hover rouge Netflix */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <Link
            href="/movie"
            className="text-center text-netflix-light py-2 px-3 border border-white/15 hover:border-netflix-red hover:bg-netflix-red/10 hover:text-white rounded-lg transition-colors text-sm"
          >
            Créer un film
          </Link>
          <Link
            href="/movie/newserie"
            className="text-center text-netflix-light py-2 px-3 border border-white/15 hover:border-netflix-red hover:bg-netflix-red/10 hover:text-white rounded-lg transition-colors text-sm"
          >
            Créer une série
          </Link>
          <Link
            href="/dashboard"
            className="text-center text-netflix-light py-2 px-3 border border-white/15 hover:border-netflix-red hover:bg-netflix-red/10 hover:text-white rounded-lg transition-colors text-sm"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreateEpisodeForm;
