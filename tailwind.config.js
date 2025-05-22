/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx,mdx}",
    "./components/**/*.{js,jsx,mdx}",
    "./app/**/*.{js,jsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "netflix-red": "#E50914",
        "netflix-black": "#141414",
        "netflix-dark": "#181818",
        "netflix-gray": "#808080",
        "netflix-light": "#E5E5E5",
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        spotlight: "spotlight 2s ease .75s 1 forwards",
        "netflix-spin": "netflix-spin 1.2s linear infinite",
        "netflix-spin-2": "netflix-spin 1.8s linear infinite reverse",
        "netflix-spin-3": "netflix-spin 2.4s linear infinite",
        "netflix-spinner": "netflixSpinner 1s linear infinite",
        "netflix-logo": "netflixLogo 2s ease-in-out infinite",
      },
      keyframes: {
        spotlight: {
          "0%": {
            opacity: 0,
            transform: "translate(-72%, -62%) scale(0.5)",
          },
          "100%": {
            opacity: 1,
            transform: "translate(-50%,-40%) scale(1)",
          },
        },
        "netflix-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        netflixSpinner: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        netflixLogo: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
      fontFamily: {
        netflix: ["Netflix Sans", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar-hide")],
};
