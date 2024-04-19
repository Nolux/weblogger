<script>
  import { enhance } from "$app/forms";

  export let form;
</script>

<section>
  <form method="post">
    <div class="group">
      <label for="email">Email</label>

      <input type="email" name="email" id="email" required />
    </div>

    <div class="group">
      <label for="password">Password</label>

      <input type="password" name="password" id="password" required />
    </div>

    <div class="submit-container">
      <button type="submit">Register</button>
    </div>
    {#if form?.error}
      <div class="notice error">
        {form.error}
      </div>
    {/if}
  </form>
</section>
