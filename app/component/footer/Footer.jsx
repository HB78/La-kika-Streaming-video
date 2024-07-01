import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-1/2 mx-auto text-slate-200 py-2 text-center border-t-2 mt-3 border-red-900">
      <Link className="hover:text-red-600" href="/contact">
        Contact
      </Link>
    </footer>
  );
}
