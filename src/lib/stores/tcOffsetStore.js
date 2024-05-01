import { persisted } from "svelte-persisted-store";

export const tcOffsets = persisted("tcOffset", {
  hours: 0,
  minutes: 0,
  seconds: 0,
  frames: 0,
});
