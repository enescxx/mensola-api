import cron from "node-cron";
import pool from "@/config/db";

/**
 * Initializes cleanup job for soft deleted users.
 * Runs every day at midnight (0 0 * * *).
 */
export const initCleanupUsersJob = (): void => {
    // Run daily at midnight
    cron.schedule("0 0 * * *", async () => {
        console.log("[CRON] Starting soft-deleted users cleanup job...");
        try {
            const result = await pool.query(`
                DELETE FROM "User"
                WHERE "deletedAt" IS NOT NULL AND "deletedAt" <= NOW() - INTERVAL '30 days';
            `);
            console.log(`[CRON] Soft-deleted users cleanup finished. Deleted ${result.rowCount} accounts.`);
        } catch (error) {
            console.error("[CRON] Soft-deleted users cleanup failed:", error);
        }
    });
};
