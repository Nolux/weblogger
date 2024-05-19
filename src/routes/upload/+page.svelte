<script>
  import { enhance } from "$app/forms";
  const authorizedExtensions = [".txt"];

  export let form;

  $: {
    if (form?.error) {
      console.log(form);
    }
    if (form?.logs) {
      console.log(form);
    }
  }
</script>

<div>
  <form
    use:enhance
    method="POST"
    enctype="multipart/form-data"
    accept={authorizedExtensions.join(",")}
    required
  >
    <input type="date" name="localDate" id="localDate" />
    <input type="file" name="file" id="file" />
    <button class="btn" type="submit"></button>
  </form>
</div>
