<script>
  import { auth } from "$lib/store/firebase";
  import { goto } from "$app/navigation";
  import { alertStore } from "$lib/store/alertStore";
  import { createUserWithEmailAndPassword } from "firebase/auth";

  let userInput = { email: "", password: "" };

  let onSubmit = () => {
    createUserWithEmailAndPassword(auth, userInput.email, userInput.password)
      .then((user) => {
        goto("/");
      })
      .catch((error) => {
        alertStore.add({ type: "error", message: error.message });
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
      <label for="passwordInput" class="label">Password</label>
      <input
        type="password"
        bind:value={userInput.password}
        class="input input-bordered w-full max-w-xs"
      />
    </div>
    <button class="btn mb-4" on:click|preventDefault={() => onSubmit()}
      >Register</button
    >
  </div>
</div>
