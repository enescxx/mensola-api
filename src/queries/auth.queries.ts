export const authQueries = {
    /**
     * Database queries for the User entity
     */
    user: {
        create: `
            INSERT INTO "User" (id, email, username, password, "createdAt", "updatedAt") 
            VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW()) 
            RETURNING id, email, username;`,
        findByEmail: `
            SELECT id, email, username, password
            FROM "User" WHERE email = $1`,
        findIdByEmail: `SELECT id FROM "User" WHERE email = $1`,
        // Retrieves user ID if a valid password reset ticket exists and hasn't expired
        findByTicket: `SELECT id FROM "User" WHERE "resetToken" = $1 AND "resetTokenExpires" > NOW()`,
        // Updates user password and clears reset token metadata
        updatePassword: `UPDATE "User" SET password = $1, "resetToken" = NULL, "resetTokenExpires" = NULL WHERE id = $2`
    },

    /**
     * Database queries for Session and Refresh Token management
     */
    session: {
        create: `INSERT INTO "Session" ("userId", "refreshToken") VALUES ($1, $2)`,
        getByToken: `SELECT * FROM "Session" WHERE "refreshToken" = $1`,
        deleteByToken: `DELETE FROM "Session" WHERE "refreshToken" = $1`,
        deleteByUserId: `DELETE FROM "Session" WHERE "userId" = $1`
    },

    /**
     * Database queries for Password Reset Token verification and updates
     */
    token: {
        // Verifies if the reset token matches the user's email and is still unexpired
        verify: `SELECT id FROM "User" WHERE email = $1 AND "resetToken" = $2 AND "resetTokenExpires" > NOW()`,
        setByEmail: `UPDATE "User" SET "resetToken" = $1, "resetTokenExpires" = $2 WHERE email = $3`,
        setById: `UPDATE "User" SET "resetToken" = $1, "resetTokenExpires" = $2 WHERE id = $3`
    }
} as const;
