"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";

const CreateFormForgotPassword = () => {
  //on créer le schéma de verification des input avec yup
  const schema = yup.object().shape({
    email: yup
      .string()
      .email("Entrez une adresse email valide")
      .required("Remplissez le champ 'Email'"),
  });
  //on créer les constante de validation des input avec react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmitForm = async (data, e) => {
    console.log("data:", data);
    e.preventDefault();
    const res = await fetch(
      `https://lakika.vercel.app/api/users/forgotPassword`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
        }),
      }
    );
    console.log("res:", res);
    if (res.ok) {
      toast.success(
        "Un email vous été envoyé pour réinitialiser votre mot de passe"
      );
    } else {
      console.log("error:", res.json());
      return toast.error("mauvaise adresse email");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitForm)}
      className="w-full flex flex-col py-4"
    >
      <input
        {...register("email")}
        className="p-3 my-2 bg-gray-700 rounded focus:border-red-500 focus:outline-none focus:border"
        type="email"
        id="email"
        placeholder="Email"
        autoComplete="email"
      />
      <small className="text-red-500">{errors.email?.message}</small>
      <button
        disabled={isSubmitting}
        className="bg-red-600 py-3 my-6 rounded font-bold hover:bg-red-700 cursor-pointer transition duration-300 ease-in-out"
      >
        {isSubmitting ? "Sending..." : "Sign In"}
      </button>
      <div className="flex justify-between items-center text-sm text-gray-600"></div>
      <p className="py-8">
        <Link href={"/"}>
          <span className="text-gray-600 hover:text-red-500 cursor-pointer">
            Page d'accueil
          </span>{" "}
        </Link>
        <Link href="/login" className="hover:text-red-500 ml-1">
          Login
        </Link>
      </p>
    </form>
  );
};

export default CreateFormForgotPassword;
