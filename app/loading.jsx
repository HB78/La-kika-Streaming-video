export default function Loading() {
  return (
    <div
      className="min-h-screen bg-black flex flex-col items-center justify-center relative"
      role="status"
      aria-label="Chargement en cours"
    >
      {/* Logo LA KIKA simple */}
      <div className="mb-20">
        <h1
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-red-600 tracking-wider font-netflix"
          aria-label="La Kika"
        >
          LA KIKA
        </h1>
      </div>

      {/* Spinner Netflix original en bas */}
      <div
        className="absolute bottom-20"
        role="progressbar"
        aria-label="Indicateur de chargement"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuetext="Chargement en cours"
      >
        <div className="relative w-14 h-14">
          {/* Cercles multiples pour effet Netflix */}
          <div
            className="absolute inset-0 border-2 border-red-600 border-t-transparent border-r-transparent rounded-full animate-netflix-spin opacity-100 filter drop-shadow-[0_0_3px_rgba(229,9,20,0.4)]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-1 border-2 border-red-500 border-t-transparent border-r-transparent rounded-full animate-netflix-spin-2 opacity-60"
            aria-hidden="true"
          />
          <div
            className="absolute inset-2 border-1 border-red-400 border-t-transparent border-r-transparent rounded-full animate-netflix-spin-3 opacity-30"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Message pour les lecteurs d'écran */}
      <span className="sr-only">
        Chargement de La Kika en cours, veuillez patienter...
      </span>
    </div>
  );
}
