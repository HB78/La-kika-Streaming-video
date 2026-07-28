"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { DropZone } from "../dropzones/DropZone";

/**
 * Formulaire « Créer une série » — direction Cinématique.
 *
 * Comme le film, ce composant porte le gabarit (poster héros + formulaire).
 * Différence : une série n'a PAS de vidéo — titre + affiche suffisent
 * (l'API /api/serie exige d'ailleurs title ET photo, sinon 400).
 */
const CreateSerieForm = () => {
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const schema = yup.object().shape({
    title: yup.string("entrez un nom valide").required("remplissez le champs"),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const title = watch("title");
  // On ne publie que si le titre est saisi ET l'affiche envoyée
  const ready = Boolean(title?.trim()) && Boolean(photoUrl);

  function getInfo(info) {
    setPhotoUrl(info); // URL de l'affiche renvoyée par la DropZone
  }

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await fetch(`https://lakika.vercel.app/api/serie`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title.trim(),
          photo: photoUrl,
        }),
      });
      if (res.ok) {
        alert(`« ${data.title} » a bien été envoyée dans la base de données.`);
      } else {
        alert("Erreur : la création a échoué.");
      }
    } catch (error) {
      alert("Erreur réseau, réessayez.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] bg-gradient-to-b from-[#191818] to-netflix-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
      {/* ── Poster héros : reflet live de l'affiche + du titre ─────────────── */}
      <div className="relative min-h-[300px] lg:min-h-[470px] flex flex-col justify-end p-6 gap-2 overflow-hidden">
        {photoUrl ? (
          <>
            <Image
              src={photoUrl}
              alt="Affiche de la série"
              fill
              className="object-cover"
              sizes="280px"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/90" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(11,11,11,0) 35%, rgba(11,11,11,0.9)), repeating-linear-gradient(115deg, #241111 0 14px, #1b0d0d 14px 28px)",
            }}
          />
        )}

        <span className={`absolute top-5 left-6 z-10 text-[10px] font-mono tracking-[0.2em] ${photoUrl ? "text-green-500" : "text-white/40"}`}>
          {photoUrl ? "✓ AFFICHE ENVOYÉE" : "APERÇU · AFFICHE 2:3"}
        </span>
        <h2 className="relative z-10 font-bold text-3xl leading-[0.95] tracking-tight text-white uppercase break-words">
          {title?.trim() || "Titre de la série"}
        </h2>
        <p className="relative z-10 font-mono text-[11px] tracking-widest text-netflix-gray">
          {!photoUrl && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-netflix-red mr-1.5 align-middle" />
          )}
          SÉRIE · APERÇU EN DIRECT
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
            Créer une série
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          {/* Titre */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm text-netflix-light">
              Titre de la série
            </label>
            <input
              className="text-white w-full p-3 bg-netflix-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-netflix-red focus:border-netflix-red focus:outline-none transition-all"
              type="text"
              placeholder="Entrez le titre de la série"
              id="title"
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? "title-error" : undefined}
              {...register("title")}
            />
            {errors.title && (
              <p id="title-error" className="text-netflix-red text-sm">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Affiche (une série n'a pas de vidéo) */}
          <div className="space-y-2">
            <label className="block text-sm text-netflix-light">Affiche</label>
            <DropZone getInfo={getInfo} />
          </div>

          {/* Barre d'action : checklist + bouton verrouillé */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-5 border-t border-white/10">
            <ul className="flex gap-5">
              <li className="flex items-center gap-2 text-sm text-netflix-gray">
                <span aria-hidden="true" className={title?.trim() ? "text-green-500" : "text-netflix-gray"}>
                  {title?.trim() ? "✓" : "○"}
                </span>
                Titre
              </li>
              <li className="flex items-center gap-2 text-sm text-netflix-gray">
                <span aria-hidden="true" className={photoUrl ? "text-green-500" : "text-netflix-gray"}>
                  {photoUrl ? "✓" : "○"}
                </span>
                Affiche
              </li>
            </ul>
            <div className="flex flex-col items-stretch sm:items-end gap-1.5">
              <button
                type="submit"
                disabled={!ready || saving}
                aria-describedby={!ready ? "publish-hint" : undefined}
                className="bg-netflix-red hover:bg-netflix-red/90 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-netflix-red/30 disabled:text-white/50"
              >
                {saving ? "Publication…" : "Publier la série"}
              </button>
              {!ready && (
                <p id="publish-hint" className="text-xs text-netflix-gray" aria-live="polite">
                  Titre et affiche requis.
                </p>
              )}
            </div>
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
            href="/movie/newepisode"
            className="text-center text-netflix-light py-2 px-3 border border-white/15 hover:border-netflix-red hover:bg-netflix-red/10 hover:text-white rounded-lg transition-colors text-sm"
          >
            Nouvel épisode
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

export default CreateSerieForm;
