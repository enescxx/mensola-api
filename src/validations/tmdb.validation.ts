import { z } from "zod";
import { pageQueryRule } from "./common.validation";

export const searchMovieSchema = z.object({
    query: z.object({
        query: z.string(),
    }),
    page: pageQueryRule,
});
