import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET was not found in the .env file.");
}

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

export { generateToken };
