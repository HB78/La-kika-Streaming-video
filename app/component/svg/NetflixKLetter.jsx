"use client";

import { motion } from "framer-motion";

const NetflixKLetter = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 300"
      style={{ width: "100%", maxWidth: "300px" }}
    >
      <motion.path
        d="M50,50 L50,250 
           M50,150 L150,50 
           M50,150 L150,250"
        fill="none"
        stroke="#E50914"
        strokeWidth="20"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 2,
          ease: "easeInOut",
        }}
      />
    </svg>
  );
};

export default NetflixKLetter;
