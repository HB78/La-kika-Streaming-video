"use client";
import { forgotPassworddAction } from "@/actions/formActionForgotPassword";
import Link from "next/link";

const CreateFormForgotPassword = () => {
  return (
    <form
      action={async (formData) => {
        await forgotPassworddAction(formData);
      }}
      className="w-full flex flex-col py-4"
    >
      <label htmlFor="email" className="hidden">
        Email
      </label>
      <input
        name="email"
        className="p-3 my-2 bg-gray-700 rounded focus:border-red-500 focus:outline-none focus:border"
        type="email"
        id="email"
        placeholder="Email"
        autoComplete="email"
        required
      />
      <small className="text-red-500">{null}</small>
      <button
        // disabled={isSubmitting}
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
