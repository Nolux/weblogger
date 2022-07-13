import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";

import { writable, get } from "svelte/store";
import { db } from "$lib/store/firebase";
import { user } from "$lib/store/userStore";

const createRecentLogs = () => {
  const { subscribe, set, update } = writable([]);

  user.subscribe((user) => {
    const q = query(
      collection(db, "logs"),
      where("project.id", "==", user.user ? user.user.selectedProject.id : ""),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ ...doc.data(), id: doc.id });
        set(docs);
      });
    });
  });

  return { subscribe, set, update };
};

export let recentLogsStore = createRecentLogs();
