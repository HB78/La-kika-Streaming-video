import { HoverEffect } from "./ui/card-hover-effect";

export function CardHoverEffectDemo() {
  return (
    <div className="w-full mx-auto px-8 bg-black">
      <HoverEffect items={projects} />
    </div>
  );
}
export const projects = [
  {
    title: "Un site gratuit",
    description:
      "Lakika est un site de streaming complétement gratuit et il le restera. Le site est toutefois temporaire il disparaitra d'ici quelques mois, profitez-en tant qu'il est encore là",
  },
  {
    title: "Aucune inscription",
    description:
      "Vous n'avez pas besoin de vous inscrire pour regarder vos films et séries préférés, mais inscrivez-vous pour avoir accèder aux futures fonctionnalités comme le réseau social qui arrivera en aout",
  },
  {
    title: "Zero pubs publicité et contenu exclusif",
    description:
      "Pas de publicité sur Lakika, nous ne vous embêterons pas avec des pubs. Il y n'aura sur le site du que contenu exclusif autrement dit du contenu introuvable sur Netflix, mon but est de postuler chez netflix, vous comprendrez que...",
  },
  {
    title: "Aucun tracking",
    description:
      "Nous ne vous suivons pas, nous ne vendons pas vos données, nous ne vous embêterons pas avec des cookies",
  },
  {
    title: "Téléchargement",
    description:
      "Vous pouvez télécharger vos films et séries préférés pour les regarder plus tard, mais surtout ils vous appartiendront à 100%",
  },
  {
    title: "Des défauts",
    description:
      "Lakika c'est aussi des défauts, des bugs, des erreurs, des problèmes, mais je travaille dur pour les corriger, n'hésitez pas à me contacter pour me les signaler",
  },
];
