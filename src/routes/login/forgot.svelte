<script>
  import { auth } from "$lib/store/firebase";
  import { goto } from "$app/navigation";
  import { alertStore } from "$lib/store/alertStore";
  import { sendPasswordResetEmail } from "firebase/auth";

  let userInput = { email: "" };

  let onSubmit = () => {
    sendPasswordResetEmail(auth, userInput.email)
      .then(() => {})
      .catch((error) => {})
      .finally(() => {
        alertStore.add({
          type: "info",
          message: "A password reset email has been sent",
        });
        goto("/login");
      });
  };
</script>

<div class="container w-80 p-6 mx-auto form-control">
  <div class="form-control">
    <div class="form-control pb-4">
      <label for="emailInput" class="label">Email</label>
      <input
        id="emailInput"
        type="text"
        bind:value={userInput.email}
        class="input input-bordered w-full max-w-xs"
      />
    </div>
    <button class="btn mb-4" on:click|preventDefault={() => onSubmit()}>
      Forgot
    </button>
  </div>
</div>
