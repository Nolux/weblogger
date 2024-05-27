<script>
  import Icon from "@iconify/svelte";
  import { enhance } from "$app/forms";

  import { AlertsStore } from "$lib/stores/alertsStore.js";
  import { fade } from "svelte/transition";

  export let data;

  $: project = data.project;

  export let form;

  $: {
    if (form?.error) {
      AlertsStore.addAlert(form?.error, "error");
    }
  }

  let input = {
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  };

  let passwordFocus = false;

  $: atleastEightChars = input.password.length > 7;
  $: upperCase = input.password.match(/(?=(.*[A-Z]){1,})/);
  $: lowerCase = input.password.match(/(?=(.*[a-z]){1,})/);
  $: number = input.password.match(/(?=(.*[\d]){1,})/);
</script>

<section>
  <form method="POST" class="flex flex-col gap-4" use:enhance>
    <h1 class="text-3xl text-center">Register</h1>
    {#if project}
      <h1 class="text-xl text-center">Project: {project.name}</h1>
    {/if}
    <label for="email" class="input input-bordered flex items-center gap-2">
      <Icon icon="mdi-light:email" width="24" height="24" style="fill-current"
      ></Icon>
      <input
        bind:value={input.email}
        type="email"
        name="email"
        id="email"
        class="grow"
        placeholder="Email"
        required
      />
    </label>
    <label for="password" class="input input-bordered flex items-center gap-2">
      <Icon icon="mdi-light:lock" width="24" height="24" style="fill-current"
      ></Icon>
      <input
        on:focus={() => {
          passwordFocus = true;
        }}
        on:blur={() => {
          passwordFocus = false;
        }}
        bind:value={input.password}
        type="password"
        name="password"
        id="password"
        class="grow"
        placeholder="Password"
        required
      />
    </label>
    {#if passwordFocus}
      <span class="flex justify-between items-center" transition:fade
        ><input
          type="checkbox"
          class="checkbox checkbox-xs"
          bind:checked={atleastEightChars}
        />At least 8 characters</span
      >
      <span class="flex justify-between items-center" transition:fade
        ><input
          type="checkbox"
          class="checkbox checkbox-xs"
          bind:checked={upperCase}
        />One uppercase letter</span
      >
      <span class="flex justify-between items-center" transition:fade
        ><input
          type="checkbox"
          class="checkbox checkbox-xs"
          bind:checked={lowerCase}
        />One lowercase letter</span
      >
      <span class="flex justify-between items-center" transition:fade
        ><input
          type="checkbox"
          class="checkbox checkbox-xs"
          bind:checked={number}
        />One Number</span
      >
    {/if}
    <label for="firstName" class="input input-bordered flex items-center gap-2">
      <Icon icon="mdi-light:account" width="24" height="24" style="fill-current"
      ></Icon>
      <input
        bind:value={input.firstName}
        type="text"
        name="firstName"
        id="firstName"
        class="grow"
        placeholder="First Name"
        required
      />
    </label>
    <label for="lastName" class="input input-bordered flex items-center gap-2">
      <Icon icon="mdi-light:account" width="24" height="24" style="fill-current"
      ></Icon>
      <input
        bind:value={input.lastName}
        type="text"
        name="lastName"
        id="lastName"
        class="grow"
        placeholder="Last Name"
        required
      />
    </label>

    <div class="submit-container">
      <button
        type="submit"
        class="btn btn-primary w-full"
        disabled={!input.email ||
          !input.firstName ||
          !input.lastName ||
          !atleastEightChars ||
          !upperCase ||
          !lowerCase ||
          !number}>Register</button
      >
    </div>
  </form>
</section>
