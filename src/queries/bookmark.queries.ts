export const bookmarkQueries = {
    exists: `
        SELECT EXISTS (
            SELECT 1 FROM "Bookmark"
            WHERE "userId" = $1::uuid AND "targetId" = $2::uuid AND "targetType" = $3
        ) AS "isSaved";
    `,
    add: `
        INSERT INTO "Bookmark" ("userId", "targetId", "targetType")
        VALUES ($1::uuid, $2::uuid, $3)
        ON CONFLICT ("userId", "targetId", "targetType") DO NOTHING
        RETURNING *;
    `,
    remove: `
        DELETE FROM "Bookmark"
        WHERE "userId" = $1::uuid AND "targetId" = $2::uuid AND "targetType" = $3
        RETURNING *;
    `,
    getByUser: `
        SELECT 
            b.id,
            b."targetId",
            b."targetType",
            b."createdAt"
        FROM "Bookmark" b
        WHERE b."userId" = $1::uuid 
          AND ($2::text IS NULL OR b."targetType" = $2)
        ORDER BY b."createdAt" DESC
        LIMIT $3 OFFSET $4;
    `,
};
