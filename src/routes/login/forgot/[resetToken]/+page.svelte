<script>
  import { enhance } from "$app/forms";
  import { AlertsStore } from "$lib/stores/alertsStore.js";

  export let form;

  let passwordInput = { password: "", passwordConfirm: "" };

  $: {
    if (form?.error) {
      AlertsStore.addAlert(form?.error, "error");
    }
  }
</script>

<section>
  <form method="post" class="flex flex-col gap-4" use:enhance>
    <h1 class="text-3xl">Forgot password</h1>
    <label for="password1" class="input input-bordered flex items-center gap-2">
      <input
        type="password"
        name="password"
        id="email"
        class="grow"
        placeholder="Password"
        bind:value={passwordInput.password}
        required
      />
    </label>
    <label for="password2" class="input input-bordered flex items-center gap-2">
      <input
        type="password"
        name="password"
        id="password2"
        class="grow"
        placeholder="Password again"
        bind:value={passwordInput.passwordConfirm}
        required
      />
    </label>
    <div class="submit-container">
      <button
        type="submit"
        disabled={passwordInput.password !== passwordInput.passwordConfirm ||
          passwordInput.password == ""}
        class="btn btn-primary w-full">Submit</button
      >
    </div>
  </form>
</section>
