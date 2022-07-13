<script>
  import { page } from "$app/stores";

  console.log($page.url.pathname);
  let links = $page.url.pathname.split("/");
  console.log(links);
</script>

<div class="text-sm breadcrumbs">
  <ul>
    {#each links as link}
      {#if link !== ""}
        <li><a>{link}</a></li>
      {/if}
    {/each}
  </ul>
</div>
