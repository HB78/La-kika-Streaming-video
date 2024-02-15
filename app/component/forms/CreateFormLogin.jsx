"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";

const CreateFormSignup = () => {
  const router = useRouter();
  //on créer le schéma de verification des input avec yup
  const schema = yup.object().shape({
    email: yup
      .string()
      .email("Entrez une adresse email valide")
      .required("Remplissez le champ 'Email'"),
    password: yup.string().required("Remplissez le champ 'Mot de passe'"),
  });
  //on créer les constante de validation des input avec react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data, e) => {
    try {
      e.preventDefault();
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (result?.error) {
        // Gérez l'erreur, par exemple affichez un message d'erreur
        toast.error("mauvais mot de passe ou email incorrecte");
        return;
      }
      toast.success("connexion réussie, vous allez etre redirigé");
      router.push("/");
    } catch (error) {
      console.log("error:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col py-4"
    >
      <input
        {...register("email")}
        className="p-3 my-2 bg-gray-700 rounded focus:border-red-500 focus:outline-none focus:border"
        type="email"
        id="email"
        placeholder="Email"
        // autoComplete='email'
      />
      <small className="text-red-500">{errors.email?.message}</small>
      <input
        id="password"
        {...register("password")}
        className="p-3 my-2 bg-gray-700 rounded focus:border-red-500 focus:outline-none focus:border"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
      />
      <small className="text-red-500">{errors.password?.message}</small>
      <button
        disabled={isSubmitting}
        className="bg-red-600 py-3 my-6 rounded font-bold"
      >
        {isSubmitting ? "Signing In..." : "Sign In"}
      </button>
      <div className="flex justify-between items-center text-sm text-gray-600"></div>
      <p className="py-8">
        <Link href={"/"}>
          <span className="text-gray-600 hover:text-red-500 cursor-pointer">
            page d'accueil
          </span>{" "}
        </Link>
        <Link href="/register" className="hover:text-red-500 ml-1">
          Sign Up
        </Link>
      </p>
    </form>
  );
};

export default CreateFormSignup;
