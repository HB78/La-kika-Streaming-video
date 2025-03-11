//fonction pour fetcher les films de la bdd je l'utilise dans la page pricipale à la racine du site dans le page.jsx

//quand on crée une route api avec nextjs 14, on peut utiliser fetch pour récupérer les données de cette façon et pas autrement

export const fetchMovies = async () => {
  const response = await fetch(
    `${process.env.NEXTAUTH_URL}/api/video`,
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

  return response.json();
};

//fonction pour fetcher les serie de la bdd je l'utilise dans la page pricipale à la racine du site dans le page.jsx
export const fetchSeries = async () => {
  const response = await fetch(
    `${process.env.NEXTAUTH_URL}/api/serie`,
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
    `${process.env.NEXTAUTH_URL}/api/episode/${id}`,
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
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/video/${id}`, {
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

// LES DELETE fetch POUR LE DASHBOARD

export const deleteMovie = async (id) => {
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/deletemovie`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id,
    }),
  });

  if (!response.ok) {
    throw new Error("Response error");
  }

  const responseData = await response.json();
  return responseData;
};

export const deleteSerie = async (id) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/deleteserie`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Response error");
  }

  const responseData = await response.json();
  return responseData;
};

export const deleteEpisode = async (id) => {
  try {
    const url = "/api/deleteepisode";
    console.log("URL avant fetch:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    console.log("URL effective:", response.url); // Ceci montrera l'URL effective utilisée

    if (response.ok) {
      console.log("response:--> data", response);
      const responseData = await response.json();
      return responseData;
    } else {
      const responseData = await response.json();
      console.log("response 1 error --->", response);
      console.log("---> response 2", responseData);
      return response;
    }
  } catch (error) {
    console.log("error:ERROR ULTIME LORS DU FETCH", error);
  }
};
