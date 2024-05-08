"use client";

import { TypewriterEffect } from "./ui/typewriter-effect";

export function TypewriterEffectDemo() {
  const words = [
    {
      text: "Let's",
      className: "max-md:text-2xl text-white",
    },
    {
      text: "talk",
      className: "max-md:text-2xl text-white",
    },
    {
      text: "with",
      className: "max-md:text-2xl text-white",
    },
    {
      text: "Lakika.",
      className: "max-md:text-2xl text-red-700 dark:text-red-700",
    },
  ];
  return (
    <div className="flex flex-col items-center justify-center mb-2">
      <TypewriterEffect words={words} />
    </div>
  );
}
