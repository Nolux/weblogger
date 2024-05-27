import { z } from "zod";

export const LogModel = z.object({
  body: z.string(),
  marker: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  timecode: z.object({
    hours: z.number().positive().max(23),
    minutes: z.number().positive().max(59),
    seconds: z.number().positive().max(59),
    frames: z.number().positive().max(24), // TODO: change when updating to other framerates
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
