import { IUser, UserId } from "@/types/user";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: UserId;
                email?: string;
                username?: string;
            };
        }
    }
}
