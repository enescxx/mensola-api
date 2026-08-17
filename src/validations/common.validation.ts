import { z } from "zod";
import { MESSAGES } from "../constants/messages/tr";

export const userIdRule = z
    .string({ message: MESSAGES.ERRORS.FIELD_REQUIRED(MESSAGES.FIELDS.USER_ID) })
    .uuid(MESSAGES.ERRORS.INVALID_UUID(MESSAGES.FIELDS.USER_ID))
    .optional();

export const trackIdRule = z
    .string({ message: MESSAGES.ERRORS.FIELD_REQUIRED(MESSAGES.FIELDS.TRACK_ID) })
    .uuid(MESSAGES.ERRORS.INVALID_UUID(MESSAGES.FIELDS.TRACK_ID))
    .trim()
    .optional();

export const pageQueryRule = z.coerce
    .number({ message: MESSAGES.ERRORS.FIELD_REQUIRED(MESSAGES.FIELDS.PAGE_NUMBER) })
    .int("Sayfa numarası tam sayı olmalıdır.")
    .min(1, MESSAGES.ERRORS.PAGE_MIN)
    .optional();

export const limitQueryRule = z.coerce
    .number({ message: MESSAGES.ERRORS.FIELD_REQUIRED(MESSAGES.FIELDS.LIMIT) })
    .int("Limit tam sayı olmalıdır.")
    .min(1, MESSAGES.ERRORS.LIMIT_RANGE)
    .max(100, MESSAGES.ERRORS.LIMIT_RANGE)
    .optional();

export const emailRule = z
    .string({ message: MESSAGES.ERRORS.FIELD_REQUIRED(MESSAGES.FIELDS.EMAIL) })
    .email(MESSAGES.ERRORS.INVALID_EMAIL);

export const usernameRule = z
    .string({ message: MESSAGES.ERRORS.FIELD_REQUIRED(MESSAGES.FIELDS.USERNAME) })
    .min(3, MESSAGES.ERRORS.MIN_LENGTH(MESSAGES.FIELDS.USERNAME, 3))
    .max(20, MESSAGES.ERRORS.MAX_LENGTH(MESSAGES.FIELDS.USERNAME, 20));

export const passwordRule = z
    .string({ message: MESSAGES.ERRORS.FIELD_REQUIRED(MESSAGES.FIELDS.PASSWORD) })
    .min(6, MESSAGES.ERRORS.MIN_LENGTH(MESSAGES.FIELDS.PASSWORD, 6));

export const createOrUpdateInteractionBody = z.object({
    rating: z
        .number({ message: MESSAGES.ERRORS.FIELD_REQUIRED(MESSAGES.FIELDS.RATING) })
        .min(0, MESSAGES.ERRORS.RATING_RANGE)
        .max(10, MESSAGES.ERRORS.RATING_RANGE)
        .optional()
        .nullable(),
    comment: z
        .string({ message: MESSAGES.ERRORS.FIELD_REQUIRED(MESSAGES.FIELDS.COMMENT) })
        .trim()
        .max(2000, MESSAGES.ERRORS.MAX_LENGTH(MESSAGES.FIELDS.COMMENT, 2000))
        .optional()
        .nullable(),
    isLiked: z.boolean().optional(),
});
