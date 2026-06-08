import { persisted } from "svelte-persisted-store";
import { DEFAULT_TIMECODE_SOURCE } from "$lib/timecode/timecode.js";

export const timecodeSource = persisted("timecodeSource", DEFAULT_TIMECODE_SOURCE);
