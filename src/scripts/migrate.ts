import fs from "fs";
import path from "path";
import { Pool } from "pg";
import pool from "@/config/db";

export const runMigrations = async (dbPool: Pool): Promise<void> => {
    const client = await dbPool.connect();
    try {
        const migrationsDir = path.join(__dirname, "../migrations");
        const files = fs
            .readdirSync(migrationsDir)
            .filter((file) => file.endsWith(".sql"))
            .sort();

        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, "utf-8");

            await client.query(sql);
        }
    } finally {
        client.release();
    }
};

if (require.main === module) {
    (async () => {
        try {
            await runMigrations(pool);
            process.exit(0);
        } catch (error) {
            process.exit(1);
        } finally {
            await pool.end();
        }
    })();
}
