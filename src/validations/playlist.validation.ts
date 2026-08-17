import { z } from "zod";
import {
    createOrUpdateInteractionBody,
    limitQueryRule,
    pageQueryRule,
    trackIdRule,
    userIdRule,
} from "./common.validation";
import { MESSAGES } from "../constants/messages/tr";

export const playlistIdRule = z
    .string({ message: MESSAGES.ERRORS.FIELD_REQUIRED(MESSAGES.FIELDS.PLAYLIST_ID) })
    .uuid(MESSAGES.ERRORS.INVALID_UUID(MESSAGES.FIELDS.PLAYLIST_ID))
    .trim();

export const playlistPaginationQuerySchema = z.object({
    query: z.object({
        userId: userIdRule,
        trackId: trackIdRule.optional(),
        page: pageQueryRule,
        limit: limitQueryRule,
    }),
});

export const playlistIdParamSchema = z.object({
    params: z.object({ playlistId: playlistIdRule }),
    query: z.object({ page: pageQueryRule, limit: limitQueryRule }),
});

export const createPlaylistInteractionSchema = z.object({
    params: z.object({ playlistId: playlistIdRule }),
    body: createOrUpdateInteractionBody,
});

export const addTrackToPlaylistSchema = z.object({
    params: z.object({ playlistId: playlistIdRule, trackId: trackIdRule }),
});
