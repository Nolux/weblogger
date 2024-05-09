<script>
  import Icon from "@iconify/svelte";

  import { enhance } from "$app/forms";

  export let form;
</script>

<section>
  <form method="post" class="flex flex-col gap-4" use:enhance>
    <h1 class="text-3xl">Forgot password</h1>
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
    <div class="submit-container">
      <button type="submit" class="btn btn-primary w-full">Submit</button>
    </div>
    {#if form?.error}
      <div role="alert" class="alert alert-error">
        {form.error}
      </div>
    {/if}
    {#if form?.success}
      <div role="alert" class="alert alert-success">
        Password reset email sent! Check your spam folder.
      </div>
    {/if}
  </form>
</section>
