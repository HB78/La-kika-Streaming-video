/* eslint-disable no-unused-vars */
import Image from "next/image";
import { Toaster } from "sonner";
import CreateFormForgotPassword from "../component/forms/CreateFormForgotPassword";

const Home = () => {
  return (
    <main className="w-full h-screen relative">
      <Toaster richColors />
      <Image
        fill
        className="hidden sm:block absolute w-full h-full object-cover"
        src="https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg"
        alt="image de fond de la page de création de film avec un florilège de film en arrière plan"
      />
      <div className="bg-black/60 fixed top-0 left-0 w-full h-screen"></div>
      <section className="fixed w-full px-4 py-24 z-50">
        <div className="max-w-[450px] h-[600px] mx-auto bg-black/75 text-white">
          <article className="max-w-[320px] mx-auto py-16">
            <h1 className="text-3xl font-bold">Forgot Password</h1>
            <h2 className="text-green-600">
              Entrez l'adresse email de votre compte
            </h2>
            <CreateFormForgotPassword />
          </article>
        </div>
      </section>
    </main>
  );
};

export default Home;
