<script>
  import {
    deleteUser,
    reauthenticateWithCredential,
    signInWithEmailAndPassword,
  } from "firebase/auth";
  import { auth } from "$lib/store/firebase";
  import { alertStore } from "$lib/store/alertStore";

  const user = auth.currentUser;

  const onDelete = () => {
    // TODO: Check credential
    deleteUser(user)
      .then(() => {
        // User deleted.
        console.log("user is deleted");
      })
      .catch((error) => {
        console.log(error);
        // An error ocurred
        // ...
      });
  };
</script>

<button class="btn btn-error" on:click={onDelete}>Delete me!</button>
