import { PoolClient } from "pg";

interface CommentData {
    id: string;
    content: string;
    createdAt: Date;
}

export const upsertInteractionComment = async (
    client: PoolClient,
    interactionId: string,
    userId: string,
    comment: string | null | undefined,
): Promise<CommentData | null> => {
    if (comment === undefined) {
        const result = await client.query(
            `SELECT id, content, "createdAt" FROM "Comment"
       WHERE "interactionId" = $1 AND "parentId" IS NULL LIMIT 1`,
            [interactionId],
        );
        return result.rows[0] || null;
    }

    const trimmed = comment?.trim() ?? "";

    if (trimmed === "") {
        await client.query(`DELETE FROM "Comment" WHERE "interactionId" = $1 AND "parentId" IS NULL`, [interactionId]);
        return null;
    }

    const existing = await client.query(
        `SELECT id FROM "Comment" WHERE "interactionId" = $1 AND "parentId" IS NULL LIMIT 1`,
        [interactionId],
    );

    if (existing.rows.length > 0) {
        const updated = await client.query(
            `UPDATE "Comment" SET "content" = $1 WHERE "id" = $2 RETURNING id, content, "createdAt"`,
            [trimmed, existing.rows[0].id],
        );
        return updated.rows[0];
    } else {
        const inserted = await client.query(
            `INSERT INTO "Comment" (id, "userId", "interactionId", "content", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())
       RETURNING id, content, "createdAt"`,
            [userId, interactionId, trimmed],
        );
        return inserted.rows[0];
    }
};
