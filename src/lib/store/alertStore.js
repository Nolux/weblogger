import { writable } from "svelte/store";

function createAlertStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    set,
    add: (addition) => {
      update((alerts) => {
        alerts.push(addition);
        alerts.forEach((al, i) => {
          al.id = i;
        });
        return [...alerts];
      });
    },
    remove: (i) => {
      update((alerts) => {
        return alerts.filter((alert, index) => index !== i);
      });
    },
  };
}

export let alertStore = createAlertStore();
