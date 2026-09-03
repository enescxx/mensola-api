export const notificationQueries = {
    getPendingFollowRequests: `
        SELECT 
            f."followerId" AS "id",
            f."followedAt" AS "createdAt",
            u.id AS "actorId",
            u.username,
            u.fullname AS "fullName",
            u.avatar
        FROM "Follow" f
        JOIN "User" u ON u.id = f."followerId"
        WHERE f."followingId" = $1 AND f."status" = 'pending'
        ORDER BY f."followedAt" DESC;
    `,
    acceptFollowRequest: `
        UPDATE "Follow"
        SET "status" = 'accepted', "followedAt" = NOW()
        WHERE "followerId" = $1 AND "followingId" = $2 AND "status" = 'pending'
        RETURNING "followerId", "followingId", "status";
    `,
    declineFollowRequest: `
        DELETE FROM "Follow"
        WHERE "followerId" = $1 AND "followingId" = $2 AND "status" = 'pending'
        RETURNING "followerId", "followingId";
    `,
};
