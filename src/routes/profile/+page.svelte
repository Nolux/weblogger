<script>
  export let data;
  import { enhance } from "$app/forms";

  $: user = data.user;
  let passwordInput = { password: "", passwordConfirm: "" };

  export let form;
</script>

<h1 class="text-3xl font-bold text-center hidden lg:block lg:text-left">
  Profile
</h1>
{#if user}
  {#if form?.error}
    {form.error}
  {/if}
  {#if form?.success}
    {form.success}
  {/if}
  <div class="grid gap-4 md:w-1/2 xl:w-1/4 lg:m-auto">
    <div class="text-xl">Edit User</div>
    <form
      method="POST"
      action="?/changeUser"
      class="flex flex-col gap-4"
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
    <div class="divider"></div>
    <div class="text-xl">Change Password</div>

    <form
      method="POST"
      action="?/changePassword"
      class="flex flex-col gap-4"
      use:enhance
    >
      <label class="flex gap-2 items-center justify-between">
        Old password:
        <input
          type="password"
          name="oldPassword"
          class="input input-bordered"
        /></label
      >
      <label class="flex gap-2 items-center justify-between">
        New password:
        <input
          type="password"
          name="password"
          class="input input-bordered"
          bind:value={passwordInput.password}
        /></label
      >
      <label class="flex gap-2 items-center justify-between">
        Confirm new password:
        <input
          type="password"
          name="password"
          class="input input-bordered"
          bind:value={passwordInput.passwordConfirm}
        /></label
      >
      <button
        class="btn w-full"
        disabled={passwordInput.password !== passwordInput.passwordConfirm ||
          passwordInput.password == ""}>Change password</button
      >
    </form>
  </div>
{/if}
