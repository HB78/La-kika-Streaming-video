import { Toaster } from "sonner";
import { CardHoverEffectDemo } from "../component/CardEffectDemo";
import Navbar from "../component/Navbar";
import { SparklesPreview } from "../component/SparklesPreview";
import { SpotlightPreview } from "../component/SpotlightPreview";
import Footer from "../component/footer/Footer";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen w-full">
      <Toaster richColors />
      <Navbar position="relative" />
      <SparklesPreview />
      <CardHoverEffectDemo />
      <SpotlightPreview />
      <Footer />
    </main>
  );
}
