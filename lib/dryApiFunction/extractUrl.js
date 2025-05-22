export const extractFileIdFromUrl = (url) => {
  if (!url) return null;

  // ⚠️ IMPORTANT: Vérifier le format de tes URLs Pinata
  // Si c'est une URL IPFS comme: https://gateway.pinata.cloud/ipfs/QmXXX
  if (url.includes("/ipfs/")) {
    return url.split("/ipfs/")[1];
  }

  // Si c'est un ID direct Pinata comme: 4ad9d3d1-4ab4-464c-a42a-3027fc39a546
  // Récupérer la dernière partie après le dernier "/"
  const parts = url.split("/");
  const lastPart = parts[parts.length - 1];

  // Vérifier si c'est un UUID Pinata (format: xxxx-xxxx-xxxx-xxxx)
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(lastPart)) {
    return lastPart;
  }

  // Si c'est un hash IPFS (commence par Qm)
  if (lastPart.startsWith("Qm")) {
    return lastPart;
  }

  console.warn("Format d'URL non reconnu:", url);
  return lastPart; // Retourner quand même au cas où
};
