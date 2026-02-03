import { z } from "zod";

export const BlueskyConfigSchema = z.object({
  accounts: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().optional(),
        identifier: z.string().min(1),
        appPassword: z.string().min(1),
        enabled: z.boolean().default(true),
      })
    )
    .optional(),
});
