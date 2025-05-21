"use client";

import Image from "next/image";
import CreateMovieForm from "../component/forms/CreateMovieForm";

const Home = () => {
  return (
    <main className="min-h-screen relative overflow-hidden bg-netflix-dark">
      {/* Fond dynamique avec effet de parallaxe */}
      <div className="fixed inset-0 w-full h-full">
        <Image
          fill
          priority
          className="object-cover transform scale-105"
          src="https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg"
          alt="Arrière-plan cinématographique"
        />
        {/* Overlay avec dégradé */}
        <div className="absolute inset-0 bg-gradient-to-b from-netflix-black/95 via-netflix-dark/90 to-netflix-black/95" />
      </div>

      {/* Contenu principal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          {/* Carte principale */}
          <div className="bg-netflix-dark/90 backdrop-blur-md rounded-2xl shadow-2xl border border-netflix-red/20 overflow-hidden">
            {/* En-tête */}
            <div className="p-8 border-b border-netflix-red/20">
              <h1 className="text-2xl font-bold text-center text-netflix-red">
                Créer un nouveau film
              </h1>
            </div>

            {/* Formulaire */}
            <div className="p-8">
              <CreateMovieForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
