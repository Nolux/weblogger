<script>
  import { signInWithEmailAndPassword } from "firebase/auth";
  import { goto } from "$app/navigation";

  import { auth } from "$lib/store/firebase";
  import { user } from "$lib/store/userStore";
  let userInput = { email: "", password: "" };
</script>

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
  <button
    class="btn mb-4"
    on:click|preventDefault={() => {
      signInWithEmailAndPassword(auth, userInput.email, userInput.password)
        .then((result) => {
          // Signed in successfully.
          goto("/");
        })
        .catch((err) => console.log(err));
    }}>Sign in</button
  >
  <button
    class="btn mb-4"
    on:click|preventDefault={() => {
      goto("/login/forgot");
    }}>Forgot Password</button
  >
  <button
    class="btn mb-4"
    on:click|preventDefault={() => {
      goto("/login/register");
    }}>Register</button
  >
</div>
