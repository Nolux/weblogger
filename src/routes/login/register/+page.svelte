<script>
  import Icon from "@iconify/svelte";

  import { enhance } from "$app/forms";

  export let form;
</script>

<section>
  <form method="post" class="flex flex-col gap-4" use:enhance>
    <h1 class="text-3xl">Register</h1>
    <label for="email" class="input input-bordered flex items-center gap-2">
      <Icon icon="mdi-light:email" width="24" height="24" style="fill-current"
      ></Icon>
      <input
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
        type="password"
        name="password"
        id="password"
        class="grow"
        placeholder="Password"
        required
      />
    </label>
    <label for="firstName" class="input input-bordered flex items-center gap-2">
      <Icon icon="mdi-light:account" width="24" height="24" style="fill-current"
      ></Icon>
      <input
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
        type="text"
        name="lastName"
        id="lastName"
        class="grow"
        placeholder="Last Name"
        required
      />
    </label>

    <div class="submit-container">
      <button type="submit" class="btn btn-primary w-full">Register</button>
    </div>
    {#if form?.error}
      <div class="notice error">
        {form.error}
      </div>
    {/if}
  </form>
</section>
