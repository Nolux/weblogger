import { writable, readable } from "svelte/store";
import { browser } from "$app/env";

export let themeChoices = readable([
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
]);

const createTheme = () => {
  let getTheme =
    browser && localStorage.getItem("theme")
      ? localStorage.getItem("theme")
      : "dark";
  const { subscribe, set, update } = writable(getTheme);
  return { subscribe, set, update };
};

export let theme = createTheme();
