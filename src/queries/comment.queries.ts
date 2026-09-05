export const commentQueries = {
    /**
     * Finds the interactionId associated with the given commentId.
     * Used as the first step in building the comment thread for a given comment.
     */
    findInteractionIdByCommentId: `
        SELECT "interactionId"
        FROM "Comment"
        WHERE id = $1::uuid
        LIMIT 1
    `,

    /**
     * Fetches all comments belonging to a given interactionId.
     *
     * - Joins the User table to include id, username, and avatar for each comment.
     * - Returns comments in chronological order (createdAt ASC) to represent a conversation flow.
     * - Supports offset-based pagination via LIMIT and OFFSET.
     * - Each row includes parentId so the client can reconstruct the thread hierarchy if needed.
     */
    getCommentsByInteractionId: `
        SELECT
            c.id                        AS "id",
            c."interactionId"           AS "interactionId",
            c."parentId"                AS "parentId",
            c.content                   AS "content",
            c."createdAt"               AS "createdAt",
            json_build_object(
                'id',       u.id,
                'username', u.username,
                'avatar',   u.avatar
            )                           AS "user"
        FROM "Comment" c
        JOIN "User" u ON u.id = c."userId"
        WHERE c."interactionId" = $1::uuid
        ORDER BY c."createdAt" ASC
        LIMIT $2 OFFSET $3
    `,

    /**
     * Returns the total number of comments for a given interactionId.
     * Used for building pagination metadata (total, hasMore).
     */
    countCommentsByInteractionId: `
        SELECT COUNT(*)::int AS total
        FROM "Comment"
        WHERE "interactionId" = $1::uuid
    `,
};
