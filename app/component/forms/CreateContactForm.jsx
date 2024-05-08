"use client";
import emailjs from "@emailjs/browser";
import { yupResolver } from "@hookform/resolvers/yup";
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
    name: yup.string().required("Remplissez le champ 'Name'"),
    message: yup.string().required("Remplissez le champ 'Name'"),
  });
  //on créer les constante de validation des input avec react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const sendEmail = async (data) => {
    console.log("data:putain", data);
    let emailTemplate = {
      to_name: "Hicham",
      from_name: data.name,
      message: data.message,
      from_email: data.email,
    };
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        emailTemplate,
        {
          publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_ID,
        }
      );
      console.log("SUCCESS!");
    } catch (err) {
      if (err) {
        console.log("EMAILJS FAILED...", err);
        return;
      }

      console.log("ERROR", err);
    }
  };

  const onSubmit = async (data) => {
    try {
      const result = await sendEmail(data);
      if (result?.error) {
        // Gérez l'erreur, par exemple affichez un message d'erreur
        toast.error("mauvais mot de passe ou email incorrecte");
        return;
      }
      toast.success("connexion réussie, vous allez etre redirigé");
    } catch (error) {
      console.log("error:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-[100%] flex flex-col py-4 text-white xl:w-[60%] sm:text-sm md:text-md xl:text-xl"
    >
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
        className="w-1/2 mx-auto bg-red-600 py-3 my-6 rounded font-bold hover:bg-red-700"
      >
        {isSubmitting ? "Envoi en cours" : "Envoyer"}
      </button>
      <div className="flex justify-between items-center text-sm text-gray-600"></div>
    </form>
  );
};

export default CreateFormSignup;
