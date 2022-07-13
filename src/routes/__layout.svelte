<script>
  import "$lib/global.css";
  import { onMount } from "svelte";
  import Nav from "../components/Nav.svelte";
  import Alert from "../components/Alert.svelte";

  import { app, auth } from "$lib/store/firebase";

  import { user } from "$lib/store/userStore";
  import { theme } from "$lib/store/themeStore";

  onMount(() => {
    let htmlSelector = document.documentElement;
    // Change theme on store update
    theme.subscribe((theme) => {
      htmlSelector.setAttribute("data-theme", theme);
    });
  });
  console.log($user);
</script>

<div class="w-screen h-screen">
  <Nav />
  <Alert />
  <div class="">
    <slot>Nothing found</slot>
  </div>
</div>
