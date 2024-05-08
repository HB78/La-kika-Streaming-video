import { CardHoverEffectDemo } from "../component/CardEffectDemo";
import Navbar from "../component/Navbar";
import { SparklesPreview } from "../component/SparklesPreview";
import { SpotlightPreview } from "../component/SpotlightPreview";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen w-full">
      <Navbar position="relative" />
      <SparklesPreview />
      <CardHoverEffectDemo />
      <SpotlightPreview />
    </main>
  );
}
