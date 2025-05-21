import Image from "next/image";
import CreateEpisodeForm from "../../component/forms/CreateEpisodeForm";
export const dynamic = "force-dynamic";

const Home = () => {
  return (
    <main className="w-full min-h-screen relative bg-black">
      {/* Image de fond cinématographique */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <Image
          priority
          fill
          className="hidden sm:block object-cover opacity-80 scale-105"
          src="https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg"
          alt="Arrière-plan cinématographique"
          quality={85}
        />
        {/* Overlay avec dégradé Netflix */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/70"></div>

        {/* Effet de vignette pour un look plus cinématographique */}
        <div className="absolute inset-0 box-border shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]"></div>
      </div>

      {/* Conteneur principal avec effet de profondeur */}
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center pt-4 pb-12">
        {/* Logo Netflix-like en haut */}

        {/* Carte du formulaire avec style Netflix */}
        <section className="w-full max-w-[450px] px-4">
          <div className="relative">
            {/* Bordure rouge caractéristique de Netflix en haut */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-600"></div>

            {/* Conteneur principal du formulaire */}
            <article className="bg-[#141414]/90 border border-zinc-800 rounded-md shadow-xl text-white overflow-hidden">
              <div className="p-6 sm:p-8">
                <CreateEpisodeForm />
              </div>
            </article>

            {/* Effet de reflet subtil en bas */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700/30 to-transparent mt-0.5"></div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;
