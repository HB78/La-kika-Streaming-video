"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

const LogOutButton = () => {
  const { data: session, status } = useSession();

  const Noactive = "text-white pr-4";
  const active = "bg-red-600 px-6 py-2 rounded cursor-pointer text-white";

  if (status === "authenticated") {
    return (
      <button
        aria-label="Déconnexion"
        onClick={() => {
          signOut({
            callbackUrl: `${process.env.NEXTAUTH_URL}
          `,
          });
        }}
        className={active}
      >
        LogOut
      </button>
    );
  }

  return (
    <div>
      <Link href={"/login"}>
        <button className={Noactive}>Sign In</button>
      </Link>
      <Link href={"/register"}>
        <button className={active}>Sign up</button>
      </Link>
    </div>
  );
};

export default LogOutButton;
