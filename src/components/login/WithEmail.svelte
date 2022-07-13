<script>
  import { signInWithEmailAndPassword } from "firebase/auth";
  import { auth } from "$lib/store/firebase";
  import { user } from "$lib/store/userStore";
  let userInput = { email: "", password: "" };
</script>

<label for="emailInput">Email</label>
<input id="emailInput" type="text" bind:value={userInput.email} />
<label for="passwordInput">Password</label>
<input type="password" bind:value={userInput.password} />
<button
  class="btn"
  on:click|preventDefault={() => {
    signInWithEmailAndPassword(auth, userInput.email, userInput.password)
      .then((result) => {
        // Signed in successfully.
      })
      .catch((err) => console.log(err));
  }}>Sign in</button
>
