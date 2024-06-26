"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa6";
import { toast } from "sonner";
import * as yup from "yup";

const CreateFormSignup = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(!showPassword);

  //on créer le schéma de verification des input avec yup
  const schema = yup.object().shape({
    name: yup.string("entrez un nom valide").required("remplissez le champs"),
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

  const onSubmit = async (data) => {
    const res = await fetch(`https://lakika.vercel.app/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });
    if (res.ok) {
      toast.success("utilisateur crée avec succès");
      router.push("/login");
    } else {
      const errorResponse = await res.json();
      console.log(errorResponse, errors);
      toast.error(errorResponse);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col py-4"
    >
      <input
        id="name"
        {...register("name")}
        className="p-3 my-2 bg-gray-700 rounded focus:border-red-500 focus:outline-none focus:border"
        type="text"
        placeholder="name"
        autoComplete="name"
      />
      <small className="text-red-500">{errors.name?.message}</small>
      <input
        {...register("email")}
        className="p-3 my-2 bg-gray-700 rounded focus:border-red-500 focus:outline-none focus:border"
        type="email"
        id="email"
        placeholder="Email"
        autoComplete="email"
      />
      <small className="text-red-500">{errors.email?.message}</small>
      <div className="relative w-full">
        <input
          id="password"
          {...register("password")}
          className="w-full p-3 my-2 bg-gray-700 rounded focus:border-red-500 focus:outline-none focus:border"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={togglePassword}
          className="absolute inset-y-0 right-0 mr-3"
        >
          {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
        </button>
      </div>
      <small className="text-red-500">{errors.password?.message}</small>
      <button
        disabled={isSubmitting}
        className="bg-red-600 py-3 my-6 rounded font-bold"
      >
        {isSubmitting ? "Chargement..." : "S'inscrire"}
      </button>
      <div className="flex justify-between items-center text-sm text-gray-600"></div>
      <p className="py-8">
        <Link href={"/"}>
          <span className="text-gray-600 hover:text-red-500 cursor-pointer">
            page d'accueil
          </span>{" "}
        </Link>
        <Link href="/login" className="hover:text-red-500 ml-1">
          Sign In
        </Link>
      </p>
    </form>
  );
};

export default CreateFormSignup;
