<script>
  import { onMount } from "svelte";

  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);

  import { user } from "$lib/store/userStore";
  import EmailVerified from "../../components/userprofile/EmailVerified.svelte";
  import DeleteUser from "../../components/userprofile/DeleteUser.svelte";
  console.log($user);
  let userInput = {
    displayName: "",
    email: "",
    photoURL: "",
  };

  onMount(() => {
    if ($user.user) {
      userInput.displayName = $user.user.displayName;
      userInput.email = $user.user.email;
    }
  });
</script>

<div class="p-2 container mx-auto">
  <h1>Edit Profile</h1>
  {#if $user.user}
    <div class="form-control">
      <input type="text" class="input" bind:value={userInput.displayName} />
      <input type="email" class="input" bind:value={userInput.email} />
    </div>
    {#if !$user.user.emailVerified}
      <EmailVerified />
    {/if}
    <img src={$user.user.photoURL} />
    <div>{dayjs($user.user.metadata.creationTime).fromNow()}</div>
    <DeleteUser />
  {/if}
  <button on:click={() => console.log($user.user)}>button</button>
</div>
