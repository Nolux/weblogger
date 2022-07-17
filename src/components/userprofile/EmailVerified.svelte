<script>
  import { sendEmailVerification } from "firebase/auth";
  import { auth } from "$lib/store/firebase";
  import { alertStore } from "$lib/store/alertStore";
</script>

<div>Email not verified</div>
<button
  class="btn btn-ghost"
  on:click={() => {
    sendEmailVerification(auth.currentUser).then(() => {
      alertStore.add({ type: "success", message: "Email verification sent!" });
    });
  }}>Send Verification email</button
>
