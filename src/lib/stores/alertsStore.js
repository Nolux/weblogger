import { writable } from "svelte/store";

const createAlertsStore = () => {
  const { set, update, subscribe } = writable([]);

  return {
    set,
    subscribe,
    update,
    addAlert: (text, type = "info", timeout = 5000) => {
      update((prevAlerts) => {
        const id = Date.now();

        prevAlerts[id] = { text, type };

        setTimeout(() => {
          update((prevAlerts) => {
            delete prevAlerts[id];
            return prevAlerts;
          });
        }, timeout);
        return prevAlerts;
      });
    },
  };
};

export const AlertsStore = createAlertsStore();
