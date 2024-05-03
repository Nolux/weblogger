<script>
  export let data;
  import { enhance } from "$app/forms";

  $: user = data.user;
  $: console.log(user);
</script>

<h1 class="text-3xl font-bold text-center hidden lg:block lg:text-left">
  Profile
</h1>
{#if user}
  <div class="grid gap-4">
    <form
      method="POST"
      class="flex flex-col gap-4 md:w-1/2 xl:w-1/4 lg:m-auto"
      use:enhance
    >
      <label class="flex gap-2 items-center justify-between">
        Email:
        <input
          type="text"
          name="email"
          class="input input-bordered"
          bind:value={user.email}
        /></label
      >
      <label class="flex gap-2 items-center justify-between">
        First Name:
        <input
          type="text"
          name="firstName"
          class="input input-bordered"
          bind:value={user.firstName}
        /></label
      >
      <label class="flex gap-2 items-center justify-between">
        Last Name:
        <input
          type="text"
          name="lastName"
          class="input input-bordered"
          bind:value={user.lastName}
        /></label
      >
      <button class="btn">Save</button>
    </form>
  </div>
{/if}
