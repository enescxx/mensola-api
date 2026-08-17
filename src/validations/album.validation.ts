import { z } from "zod";
import { createOrUpdateInteractionBody, limitQueryRule, pageQueryRule, userIdRule } from "./common.validation";
import { MESSAGES } from "../constants/messages/tr";

export const albumIdRule = z
    .string({ message: MESSAGES.ERRORS.FIELD_REQUIRED(MESSAGES.FIELDS.ALBUM_ID) })
    .uuid(MESSAGES.ERRORS.INVALID_UUID(MESSAGES.FIELDS.ALBUM_ID))
    .trim();

export const albumPaginationQuerySchema = z.object({
    query: z.object({ userId: userIdRule, page: pageQueryRule, limit: limitQueryRule }),
});

export const albumIdParamSchema = z.object({
    params: z.object({ albumId: albumIdRule }),
});

export const createAlbumInteractionSchema = z.object({
    params: z.object({ albumId: albumIdRule }),
    body: createOrUpdateInteractionBody,
});
