<script>
  import {
    deleteUser,
    reauthenticateWithCredential,
    signInWithEmailAndPassword,
    EmailAuthProvider,
    getAuth,
  } from "firebase/auth";
  import { auth } from "$lib/store/firebase";
  import { alertStore } from "$lib/store/alertStore";

  let userPassword = "";

  const user = auth.currentUser;

  const onDelete = async () => {
    /* CREDENTIAL NEED TO CHECK PROVIDER GOOGLE OR PASSWORD
    const auth = getAuth();
    console.log(auth.currentUser.providerData);
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      userPassword
    );
    const result = await reauthenticateWithCredential(
      auth.currentUser,
      credential
    );

    */
    // TODO: Check credential
    /*
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
    */
  };
</script>

<input type="password" bind:value={userPassword} />
<button class="btn btn-error" on:click={onDelete}>Delete me!</button>
