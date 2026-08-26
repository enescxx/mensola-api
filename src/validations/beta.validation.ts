import { z } from "zod";
import { emailRule } from "./common.validation";

export const applyBetaSchema = z.object({
    body: z.object({ firstname: z.string().optional(), email: emailRule, platform: z.string() }),
});
