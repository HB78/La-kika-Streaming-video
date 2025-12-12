import Image from "next/image";
import Link from "next/link";

const Movie = ({ item }) => {
  const imageUrl =
    item?.photo || `https://image.tmdb.org/t/p/w500/${item?.backdrop_path}`;
  const link = item?.genre ? `/${item.genre}/${item?.id}` : "/";

  return (
    <Link href={link} className="group block">
      <article className="relative w-[280px] md:w-[380px] lg:w-[440px] aspect-[16/10] cursor-pointer">
        {/* Card principale avec rotation 3D */}
        <div className="relative w-full h-full transition-all duration-700 ease-out group-hover:[transform:rotateY(-4deg)_rotateX(3deg)_translateZ(20px)] group-hover:scale-[1.02]">
          {/* Ombre dynamique */}
          <div className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 -z-20 blur-2xl bg-red-600/40" />

          {/* Reflet lumineux qui traverse la card */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out -skew-x-12" />
          </div>

          {/* Conteneur image */}
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            {/* Image */}
            <Image
              src={imageUrl}
              alt={item?.title || "Film"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 2424px) 100%"
              className="object-cover transition-all duration-1000 ease-out group-hover:scale-[1.15] group-hover:rotate-1"
              quality={70}
            />

            {/* Grain texture overlay */}
            <div
              className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />

            {/* Vignette permanente subtile */}
            <div
              className="absolute inset-0 pointer-events-none opacity-50 group-hover:opacity-70 transition-opacity duration-500"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%)",
              }}
            />

            {/* Overlay sombre au hover pour faire ressortir le titre */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-500 pointer-events-none" />

            {/* Gradient bas qui apparaît au hover */}
            <div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 35%, transparent 60%)",
              }}
            />

            {/* Ligne accent animée en bas */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] overflow-hidden">
              <div className="h-full w-0 group-hover:w-full transition-all duration-700 ease-out bg-red-600" />
            </div>

            {/* Contenu texte - CACHÉ par défaut, VISIBLE au hover */}
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
              {/* Trait décoratif animé */}
              <div className="w-0 group-hover:w-12 h-[2px] mb-3 transition-all duration-500 delay-100 bg-red-600" />

              {/* Titre */}
              <h3
                className="text-white text-lg md:text-xl lg:text-2xl leading-tight tracking-tight translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-75 truncate"
                style={{
                  fontFamily:
                    "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 700,
                  textShadow: "0 4px 30px rgba(0,0,0,0.9)",
                }}
              >
                {item?.title}
              </h3>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default Movie;
