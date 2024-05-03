"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa6";
import { toast } from "sonner";
import * as yup from "yup";

const CreateFormForgotPassword = () => {
  const params = useParams();

  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(!showPassword);

  const schema = yup.object().shape({
    password: yup
      .string()
      .required("Remplissez le champ 'new password'")
      .min(4, "Le mot de passe doit contenir au moins 8 caractères")
      .max(50, "Le mot de passe doit contenir au maximum 50 caractères"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    const res = await fetch(
      `https://lakika.vercel.app/api/resetpassword/${params.token}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword: data.password,
          id: params.id,
        }),
      }
    );
    if (res.ok) {
      toast.success(
        "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter."
      );
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
      <div className="relative w-full">
        <input
          name="password"
          {...register("password")}
          className="w-full p-3 my-2 bg-gray-700 rounded focus:border-red-500 focus:outline-none focus:border"
          type={showPassword ? "text" : "password"}
          id="password"
          placeholder="new password"
          required
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
        className="bg-red-600 py-3 my-6 rounded font-bold hover:bg-red-700 cursor-pointer transition duration-300 ease-in-out"
      >
        {isSubmitting ? "Updating" : "Update password"}
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
