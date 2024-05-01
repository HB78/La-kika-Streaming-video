"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";

const CreateFormForgotPassword = () => {
  const schema = yup.object().shape({
    email: yup
      .string()
      .email("Entrez une adresse email valide")
      .required("Remplissez le champ 'Email'"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/forgotpassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
      }),
    });
    if (res.ok) {
      toast.success("utilisateur crée avec succès");
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
      <label htmlFor="email" className="hidden">
        Email
      </label>
      <input
        name="email"
        {...register("email")}
        className="p-3 my-2 bg-gray-700 rounded focus:border-red-500 focus:outline-none focus:border"
        type="email"
        id="email"
        placeholder="Email"
        autoComplete="email"
        required
      />
      <small className="text-red-500">{errors.email?.message}</small>
      <button
        disabled={isSubmitting}
        className="bg-red-600 py-3 my-6 rounded font-bold hover:bg-red-700 cursor-pointer transition duration-300 ease-in-out"
      >
        {"send"}
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
