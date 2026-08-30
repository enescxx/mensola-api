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

export const trackParamSchema = z.object({
    params: z.object({ trackId: trackIdRule }),
});

export const addFavoriteTrackSchema = z.object({
    body: z.object({
        trackId: trackIdRule.optional(),
        spotifyId: z.string().optional(),
        replaceTrackId: trackIdRule.optional(),
    }).refine(data => data.trackId !== undefined || data.spotifyId !== undefined, {
        message: "trackId veya spotifyId belirtilmelidir.",
        path: ["trackId"]
    })
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
