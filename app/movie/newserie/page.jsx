import Image from "next/image";
import CreateSerieForm from "../../component/forms/CreateSerieForm";

const Home = async () => {
  return (
    <main className="min-h-screen relative overflow-hidden bg-netflix-black">
      {/* Fond cinématographique avec overlay dégradé */}
      <div className="fixed inset-0 w-full h-full">
        <Image
          fill
          priority
          className="object-cover transform scale-105"
          src="https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg"
          alt="Arrière-plan cinématographique"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-netflix-black/95 via-netflix-black/90 to-netflix-black/95" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_85%_-10%,rgba(229,9,20,0.12),transparent_60%)]" />
      </div>

      {/* Contenu principal : le formulaire porte lui-même le gabarit Cinématique */}
      <div className="relative min-h-screen flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-6xl">
          <CreateSerieForm />
        </div>
      </div>
    </main>
  );
};

export default Home;
