<script>
  import Icon from "@iconify/svelte";

  import { enhance } from "$app/forms";
  import { AlertsStore } from "$lib/stores/alertsStore.js";

  export let form;

  let loading = false;

  $: {
    if (form?.error) {
      AlertsStore.addAlert(form?.error, "error");
    }
  }
</script>

<section>
  <form
    method="post"
    class="flex flex-col gap-4"
    use:enhance={() => {
      loading = true;
      return async ({ update }) => {
        await update();
        loading = false;
      };
    }}
  >
    <h1 class="text-3xl">Login</h1>
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

    <div class="submit-container">
      <button type="submit" class="btn btn-primary w-full"
        >{#if loading}<span class="loading loading-spinner loading-sm"
          ></span>{:else}Login{/if}</button
      >
    </div>

    <div>
      <a class="btn btn-outline hover:btn-warning w-full" href="/login/forgot">
        Forgot password?</a
      >
    </div>
  </form>
</section>
