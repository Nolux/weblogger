import { z } from "zod";
import { MAX_FRAME } from "$lib/timecode/timecode.js";

export const LogModel = z.object({
  body: z.string(),
  marker: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  timecode: z.object({
    hours: z.number().max(23).min(0),
    minutes: z.number().max(59).min(0),
    seconds: z.number().max(59).min(0),
    frames: z.number().max(MAX_FRAME).min(0),
  }),
  timecodeString: z.string(),
  timecodeDateObj: z.string(),
  timezone: z.string(),
  localDate: z.object({
    year: z.number().positive(),
    month: z.number().positive(),
    day: z.number().positive(),
  }),
  localDateString: z.string(),
  createdById: z.string().optional(),
  createdByFullName: z.string().optional(),
});
