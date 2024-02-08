//fonction pour fetcher les films de la bdd je l'utilise dans la page pricipale à la racine du site dans le page.jsx

//quand on crée une route api avec nextjs 14, on peut utiliser fetch pour récupérer les données de cette façon et pas autrement

export const fetchMovies = async () => {
  const response = await fetch(
    `http://localhost:3000/api/video`,
    {
      next: {
        tags: ["fetchMovies"],
        revalidate: 6,
      },
    },
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  console.log(process.env.BACKEND_URL);

  return response.json();
};

//fonction pour fetcher les serie de la bdd je l'utilise dans la page pricipale à la racine du site dans le page.jsx
export const fetchSeries = async () => {
  const response = await fetch(
    `http://localhost:3000/api/serie`,
    {
      next: {
        tags: ["fetchSeries"],
        revalidate: 6,
      },
    },
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

//fetch que je fais dans la page serie/id de recherche pour récupérer une série en particulier et un episode en particulier, je l'utilise pour les metadata dynamiques mais aussi dans le component en dessous mais la fonction est la même sauf que je ne l'ai pas refactorisé
export const fetchOneSerie = async (id) => {
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/episode/${id}`,
    {
      revalidate: 0,
    },
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Response error");
  }

  const responseData = await response.json();
};

//fetch que je fais dans le page film/id pour recuperer un film en particulier, je l'utilise pour les metadata dynamiques mais aussi dans le component en dessous mais la fonction est la même sauf que je ne l'ai pas refactorisé

export const fetchOneFilm = async (id) => {
  const response = await fetch(`${process.env.BACKEND_URL}/api/video/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Response error");
  }

  const responseData = await response.json();
};
