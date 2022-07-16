<script>
  import { user } from "$lib/store/userStore";
  console.log($user);
</script>

<div class="p-2">
  {#if $user.user}
    <div>
      <div>{$user.user.displayName}</div>
      <div>{$user.user.email}</div>
      <img src={$user.user.photoURL} />
      <div>{$user.user.metadata.creationTime}</div>
      <div>{$user.user.providerId}</div>
    </div>
  {/if}
  <button on:click={() => console.log($user.user)}>button</button>
</div>
