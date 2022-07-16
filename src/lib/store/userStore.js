import { writable, get } from "svelte/store";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "$lib/store/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { goto } from "$app/navigation";
import { browser } from "$app/env";

function createUser() {
  const { subscribe, set, update } = writable({
    isLoggedIn: false,
    user: null,
  });
  if (browser) {
    console.log(localStorage.getItem("user"));
    onAuthStateChanged(auth, (user) => {
      if (user == null) {
        set({ isLoggedIn: user !== null, user: user });
        //goto("/"); TODO: OTHER WAY OF DOING IT?!
      } else {
        const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
          set({ isLoggedIn: user !== null, user: { ...user, ...doc.data() } });
        });
      }
    });
  }

  return {
    subscribe,
    signOut: () => {
      signOut(auth);
      goto("/");
    },
    selectProject: async (project) => {
      let currentUser = get(user);

      await updateDoc(doc(db, "users", currentUser.user.uid), {
        selectedProject: project,
      });
    },
  };
}

export const user = createUser();
