import { z } from "zod";
import { limitQueryRule, pageQueryRule } from "./common.validation";

export const searchTrackSchema = z.object({
    query: z.object({
        query: z.string(),
    }),
    page: pageQueryRule,
    limit: limitQueryRule,
});
