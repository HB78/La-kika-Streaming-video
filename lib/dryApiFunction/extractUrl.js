export const extractFileIdFromUrl = (url) => {
  if (!url) return null;

  try {
    const u = new URL(url);
    // Enlève le slash initial pour obtenir la clé S3/R2
    return u.pathname.startsWith("/") ? u.pathname.slice(1) : u.pathname;
  } catch {
    // Si ce n'est pas une URL valide, retourne tel quel (fallback)
    return url;
  }
};
