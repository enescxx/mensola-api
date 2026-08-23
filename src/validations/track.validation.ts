import { z } from "zod";
import {
    createOrUpdateInteractionBody,
    limitQueryRule,
    pageQueryRule,
    trackIdRule,
    userIdRule,
} from "./common.validation";

export const trackPaginationQuerySchema = z.object({
    query: z.object({ userId: userIdRule, page: pageQueryRule, limit: limitQueryRule }),
});

/**
 * Schema for validating track ID in URL parameters.
 */
export const trackParamSchema = z.object({
    params: z.object({ trackId: trackIdRule }),
});

/**
 * Schema for creating/updating a track interaction.
 */
export const createTrackInteractionSchema = z.object({
    params: z.object({ trackId: trackIdRule }),
    body: createOrUpdateInteractionBody,
});

export const spotifyIdParamSchema = z.object({
    params: z.object({ spotifyId: z.string() }),
});
