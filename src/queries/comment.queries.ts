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
     * - Joins CommentLike to compute likeCount and isLiked per comment.
     * - Returns comments in chronological order (createdAt ASC) to represent a conversation flow.
     * - Supports offset-based pagination via LIMIT and OFFSET.
     * - Each row includes parentId so the client can reconstruct the thread hierarchy if needed.
     *
     * Parameters: $1 = interactionId, $2 = limit, $3 = offset, $4 = currentUserId (nullable uuid)
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
            )                           AS "user",
            (
                SELECT COUNT(*)::int
                FROM "CommentLike" cl
                WHERE cl."commentId" = c.id
            )                           AS "likeCount",
            CASE
                WHEN $4::uuid IS NOT NULL
                THEN EXISTS (
                    SELECT 1 FROM "CommentLike" cl
                    WHERE cl."commentId" = c.id AND cl."userId" = $4::uuid
                )
                ELSE false
            END                         AS "isLiked"
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

    /* ==========================================================================
       Comment Like (Toggle)
       ========================================================================== */

    /**
     * Checks if the given user has already liked the given comment.
     * Returns the existing row or nothing.
     */
    findCommentLike: `
        SELECT 1 FROM "CommentLike"
        WHERE "userId" = $1::uuid AND "commentId" = $2::uuid
        LIMIT 1
    `,

    /**
     * Inserts a new CommentLike row.
     * ON CONFLICT DO NOTHING is a safety net; the service handles the toggle explicitly.
     */
    addCommentLike: `
        INSERT INTO "CommentLike" ("userId", "commentId")
        VALUES ($1::uuid, $2::uuid)
        ON CONFLICT ("userId", "commentId") DO NOTHING
    `,

    /**
     * Removes an existing CommentLike row (unlike operation).
     */
    removeCommentLike: `
        DELETE FROM "CommentLike"
        WHERE "userId" = $1::uuid AND "commentId" = $2::uuid
    `,

    /**
     * Returns the total like count for a given comment.
     * Used after a toggle to return the fresh count to the client.
     */
    countCommentLikes: `
        SELECT COUNT(*)::int AS "likeCount"
        FROM "CommentLike"
        WHERE "commentId" = $1::uuid
    `,

    /**
     * Verifies that a comment with the given id exists.
     * Used as a guard before attempting a like/unlike operation.
     */
    checkCommentExists: `
        SELECT id FROM "Comment"
        WHERE id = $1::uuid
        LIMIT 1
    `,

    /* ==========================================================================
       Comment Reply Queries
       ========================================================================== */

    /**
     * Finds the target parent comment and its interactionId.
     * Used to verify that the target comment exists and retrieve its interaction context.
     */
    findCommentWithInteraction: `
        SELECT id, "interactionId"
        FROM "Comment"
        WHERE id = $1::uuid
        LIMIT 1
    `,

    /**
     * Inserts a new reply comment and returns it formatted as a CommentThreadItem,
     * including joined User details (id, username, avatar) and initial likeCount / isLiked.
     *
     * Parameters:
     *   $1 = userId (uuid)
     *   $2 = interactionId (uuid)
     *   $3 = parentId (uuid - the target commentId being replied to)
     *   $4 = content (text)
     */
    createReply: `
        WITH inserted_comment AS (
            INSERT INTO "Comment" ("userId", "interactionId", "parentId", "content")
            VALUES ($1::uuid, $2::uuid, $3::uuid, $4)
            RETURNING id, "userId", "interactionId", "parentId", "content", "createdAt"
        )
        SELECT
            ic.id                        AS "id",
            ic."interactionId"           AS "interactionId",
            ic."parentId"                AS "parentId",
            ic.content                   AS "content",
            ic."createdAt"               AS "createdAt",
            json_build_object(
                'id',       u.id,
                'username', u.username,
                'avatar',   u.avatar
            )                           AS "user",
            0                           AS "likeCount",
            false                       AS "isLiked"
        FROM inserted_comment ic
        JOIN "User" u ON u.id = ic."userId"
    `,
};

