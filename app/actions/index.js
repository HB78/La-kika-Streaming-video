//pour eviter les erreurs de chemin, on importe les actions dans le fichier index.js
//c'est pour eviter de faire de longs chemins
//quand on pointe vers le dossier actions, on pointe vers le fichier index.js
//on a accès à toutes les actions
// cela donne cela import { deleteImagesAction, createImageAction, etc } from "@/app/actions";

export { deleteImagesAction } from "./deleteImagesAction";
