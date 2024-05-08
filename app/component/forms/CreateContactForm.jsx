"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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

  return (
    <form className="w-[70%] flex flex-col py-4 text-white text-xl">
      <div className="w-full">
        <input
          id="text"
          {...register("name")}
          className="w-full p-3 my-2 bg-gray-700 rounded focus:border-red-500 focus:outline-none focus:border"
          placeholder="Comment vous appelez-vous ?"
          autoComplete="current-name"
        />
        <small className="text-red-500">{errors.name?.message}</small>
      </div>
      <input
        {...register("email")}
        className="p-3 my-2 bg-gray-700 rounded focus:border-red-500 focus:outline-none focus:border"
        type="email"
        id="email"
        placeholder="Votre email pour vous contacter"
        autoComplete="email"
      />
      <small className="text-red-500">{errors.email?.message}</small>
      <textarea
        {...register("message")}
        className="p-3 my-2 bg-gray-700 rounded focus:border-red-500 focus:outline-none focus:border scrollbar-hide"
        id="message"
        placeholder="Votre message"
      />
      <small className="text-red-500 hover:text-red-700">
        {errors.message?.message}
      </small>
      <button
        disabled={isSubmitting}
        className="bg-red-600 py-3 my-6 rounded font-bold"
      >
        {isSubmitting ? "Envoi en cours" : "Envoyer"}
      </button>
      <div className="flex justify-between items-center text-sm text-gray-600"></div>
    </form>
  );
};

export default CreateFormSignup;
