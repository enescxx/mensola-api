import { z } from "zod";
import { limitQueryRule, pageQueryRule } from "./common.validation";

export const searchTrackSchema = z.object({
    query: z.object({
        query: z.string(),
        page: pageQueryRule,
        limit: limitQueryRule,
    }),
});
export const paginationQuerySchema = z.object({
    query: z.object({
        page: pageQueryRule,
        limit: limitQueryRule,
    }),
});
