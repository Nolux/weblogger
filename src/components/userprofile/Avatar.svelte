<script>
  export let size = "24";
  import { user } from "$lib/store/userStore";
</script>

{#if $user.user.photoURL}
  <div class="avatar">
    <div
      class={`w-${size} rounded-full ring ring-primary ring-offset-base-100 ring-offset-2`}
    >
      <img src={$user.user.photoURL} />
    </div>
  </div>
{:else}
  <div class="avatar placeholder">
    <div
      class={`w-${size} rounded-full ring ring-primary ring-offset-base-100 ring-offset-2`}
    >
      <span class="text-3xl uppercase"
        >{$user.user.displayName
          ? $user.user.displayName
          : $user.user.email[0]}</span
      >
    </div>
  </div>
{/if}
