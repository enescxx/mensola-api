export const betaQueries = {
    applyBeta: `
        INSERT INTO "Waitlist" (id, "firstName", email, status, platform, "createdAt")
        VALUES (gen_random_uuid(), $1, $2, 'pending', $3, NOW())
        ON CONFLICT (email) DO NOTHING
        RETURNING *;`,
};
