<script>
  import { goto, invalidateAll } from "$app/navigation";
  import { onMount } from "svelte";

  onMount(() => {
    goto("/", { invalidateAll: true });
  });
</script>
