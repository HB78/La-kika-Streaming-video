import CreateContactForm from "./forms/CreateContactForm";
import { Spotlight } from "./ui/Spotlight";

export function SpotlightPreview() {
  return (
    <div className="h-screen w-full rounded-md flex md:items-center md:justify-center bg-black antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="red" />
      <div className=" p-4 max-w-7xl  mx-auto relative z-10  w-full pt-20 md:pt-0">
        <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
          Contact
        </h1>
        <div className="flex flex-col justify-between items-center">
          <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
            Vous avez des envies particulières, des questions, des suggestions,
            des critiques, des compliments ou vous voulez participer à la
            création du site, utilisez formulaire. Je cherche également des
            personnes pouvant m'aider à étoffer le catalogue de films et séries.
            Si vous avez des films et série et que vous voulez en faire
            bénéficier le peuple n'hésitez pas à me contacter, je cherche
            surtout la saison 2 et 3 de Westworld ainsi que les deux saisons de
            Walking Dead World Beyond en autres. Merci.
          </p>
          <CreateContactForm />
        </div>
      </div>
    </div>
  );
}
