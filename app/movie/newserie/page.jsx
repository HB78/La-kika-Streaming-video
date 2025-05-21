import Image from "next/image";
import CreateSerieForm from "../../component/forms/CreateSerieForm";

const Home = () => {
  return (
    <main className="w-full min-h-screen relative overflow-hidden">
      {/* Image de fond optimisée avec priority pour le LCP */}
      <Image
        priority
        fill
        className="hidden sm:block absolute w-full h-full object-cover"
        src="https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg"
        alt="Arrière-plan cinématographique avec collection de films"
      />

      {/* Overlay avec gradient au lieu d'une simple couleur unie */}
      <div className="bg-gradient-to-b from-black/70 via-black/60 to-black/80 fixed top-0 left-0 w-full h-screen"></div>

      {/* Conteneur principal centré avec contenu */}
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center py-6">
        {/* En-tête avec titre */}

        {/* Carte du formulaire avec style amélioré */}
        <section className="w-full max-w-[450px] px-4">
          <article className="bg-black/75 text-white rounded-lg overflow-hidden border border-gray-800 shadow-lg shadow-black/40">
            {/* Barre d'accent en haut */}
            <div className="h-1 w-full bg-gradient-to-r from-red-600 to-red-600"></div>

            {/* Conteneur du formulaire */}
            <div className="p-6">
              <CreateSerieForm />
            </div>
          </article>
        </section>
      </div>
    </main>
  );
};

export default Home;
