import pool from "@/config/db";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "test-secret";

export const generateTestToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1h" });
};

export const createTestUser = async (override = {}) => {
  const id = crypto.randomUUID();

  const user = {
    id,
    username: `user_${id.substring(0, 8)}`,
    email: `user_${id}@example.com`,
    password: `${id}`,
    ...override,
  };

  const query = `
        INSERT INTO "User" (id, username, email, password)
        VALUES ($1, $2, $3, $4) RETURNING *`;

  const values = [id, user.username, user.email, user.password];

  const res = await pool.query(query, values);

  return {
    user: res.rows[0],
    token: generateTestToken(id),
  };
};
