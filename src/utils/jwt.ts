import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET was not found in the .env file.");
}

if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET was not found in the .env file.");
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const generateAccessToken = (userId: string): string => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: "15m"
    });
};

const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, {
        expiresIn: "30d"
    });
};

const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, JWT_REFRESH_SECRET);
};

export { generateAccessToken, generateRefreshToken, verifyRefreshToken };
