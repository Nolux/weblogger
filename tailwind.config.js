/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      "light",
      "dark",
      "emerald",
      "corporate",
      "retro",
      "halloween",
      "garden",
      "aqua",
      "lofi",
      "fantasy",
      "dracula",
      "cmyk",
      "business",
      "coffee",
      "winter",
      "dim",
    ],
  },
  safelist: [
    {
      pattern: /bg-.+/,
    },
    { pattern: /text-.+/ },
    { pattern: /alert-.+/ },
  ],
};
