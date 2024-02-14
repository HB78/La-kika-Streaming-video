/* eslint-disable no-unused-vars */
import Link from "next/link";
import LogOutButton from "./LogOutButton";

const Navbar = async ({ position = "absolute" }) => {
  //obtenir la data avec getserversession

  return (
    <nav
      // role="navigation"
      aria-label="Barre de navigation principale"
      className={`flex items-center justify-between p-4 z-[100] ${position} w-full`}
    >
      <Link href={"/"}>
        <h1 className="text-red-600 text-4xl font-bold cursor-pointer">
          LA KIKA
        </h1>
      </Link>
      <LogOutButton />
    </nav>
  );
};

export default Navbar;
