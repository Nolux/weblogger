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
    let email = "aselbek@nepgroup.com";
    let password = "363355Klh";
    signInWithEmailAndPassword(auth, email, password).then((credential) => {
      console.log(credential);
      reauthenticateWithCredential(user, credential)
        .then(() => {
          // User re-authenticated.
          console.log("user is authed");
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
        })
        .catch((error) => {
          console.log(error);

          // An error ocurred
          // ...
        });
    });
  };
</script>

<button class="btn btn-error" on:click={onDelete}>Delete me!</button>
