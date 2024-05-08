import requests from "@/Request";
import Link from "next/link";
import { fetchMovies, fetchSeries } from "./../fetches/fetches";
import Main from "./component/Main";
import Navbar from "./component/Navbar";
import Row from "./component/Row";

export const dynamic = "force-dynamic";

export default async function Home() {
  const responseDataMovies = await fetchMovies();
  const responseDataSeries = await fetchSeries();
  //on met toutes les requetes dans un tableau
  const urls = [
    requests.requestUpcoming,
    requests.requestTrending,
    requests.requestTopRated,
    requests.requestPopular,
  ];

  //on fait une requete pour chaque url avec un Promise.all et un map
  //normalement on fetch la data comme ça puisque elle provient d'une api exterieur   const allResponses = await Promise.all(urls.map((url) => fetch(url)));
  //le probleme c'est qu'il y a une requete qui vient de l'api folder que j'ai crée donc il faut un header et une method donc je vais en donner à toute les requetes pour etre sur que ça marche

  const allResponses = await Promise.all(urls.map((url) => fetch(url)));

  //on map sur le results de chaque requete pour les mettre en format json()
  const allMovies = await Promise.all(
    allResponses.map((response) => response.json())
  );
  //le resultat donne un objet pour reponse du fetch et les mets dans un tableau pour pouvoir les maper

  //il faut verifier une a une le resultat de chaque requete car horror etait un objet et non un tableau mais top rated etait un tableau

  //il y a deja des resultat de fetch qui sont des tableau comme upcoming donc pas besoin de les mettre dans un tableau, s'est egalement le cas pour trending mais j'ai preferer laisser

  //au final j'ai tout harmonisé mais il faudrait revoir le code pour le rendre plus propreut biennettoyer la data avant de la passer en props en les verifiant dans le console.log()

  let upcoming = allMovies[0].results;
  let trending = allMovies[1].results;
  let topRated = allMovies[2].results;
  let moviesPopular = allMovies[3].results.splice(0, 7);

  return (
    <main className="w-full h-screen">
      <Navbar />
      <Main movies={moviesPopular} />
      <Row rowID="1" title="UpComing" moviesFetched={upcoming} />
      <Row rowID="2" title="Popular" moviesFetched={moviesPopular} />
      <Row rowID="3" title="Trending" moviesFetched={trending} />
      <Row rowID="4" title="Top Rated" moviesFetched={topRated} />
      <Row rowID="6" title="Films" moviesFetched={responseDataMovies} />
      <Row rowID="7" title="Series" moviesFetched={responseDataSeries} />
      <footer className="w-full text-slate-200 py-2 text-center border-t-2 mt-3 border-red-900">
        <Link className="hover:text-red-600" href="/contact">
          Contact
        </Link>
      </footer>
    </main>
  );
}
