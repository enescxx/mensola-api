import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (
    password: string,
    hash: string
): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};

export { hashPassword, comparePassword };
