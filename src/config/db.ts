import { Pool } from "pg";

const pool = new Pool({
    host: process.env.POSTGRES_HOST || "db",
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    port: 5432
});

pool.on("connect", () => {
    console.log("The database connection was successful");
});

pool.on("error", err => {
    console.error("Unexpected database error:", err);
    process.exit(-1);
});

export const initDatabase = async (): Promise<void> => {
    const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS "User" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(50) UNIQUE NOT NULL,
      fullname VARCHAR(255),
      password TEXT NOT NULL,
      "resetToken" TEXT,
      "resetTokenExpires" TIMESTAMP WITH TIME ZONE,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

    const createSessionTableQuery = `
    CREATE TABLE IF NOT EXISTS "Session" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      "refreshToken" TEXT NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

    try {
        await pool.query(createUsersTableQuery);
        await pool.query(createSessionTableQuery);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

export default pool;
