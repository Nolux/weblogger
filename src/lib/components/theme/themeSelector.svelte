<script>
  import { onMount } from "svelte";
  const themes = [
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
    "dim",
    "nord",
    "sunset",
  ];

  let current_theme = "";

  onMount(() => {
    if (typeof window !== "undefined") {
      const theme = window.localStorage.getItem("theme");
      if (theme && themes.includes(theme)) {
        document.documentElement.setAttribute("data-theme", theme);
        current_theme = theme;
      }
      /*    
       if (!theme) {
        console.log("setting theme");
        set_theme({ event: { target: { value: "dim" } } });
      } 
      */
    }
  });

  const set_theme = (event) => {
    console.log(event.target.value);
    let theme = event.target.value;
    const one_year = 60 * 60 * 24 * 365;
    window.localStorage.setItem("theme", theme);
    document.cookie = `theme=${theme}; max-age=${one_year}; path=/;SameSite=Strict;`;
    document.documentElement.setAttribute("data-theme", theme);
    current_theme = theme;
  };
</script>

<label class="flex justify-between items-center">
  Select Theme:
  <select
    bind:value={current_theme}
    class="select select-bordered w-full max-w-xs"
    on:change={(e) => set_theme(e)}
  >
    {#each themes as theme}
      <option value={theme}>{theme}</option>
    {/each}
  </select>
</label>
