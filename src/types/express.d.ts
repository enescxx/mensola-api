import { UserId } from "@/types/common";

declare global {
    namespace Express {
        interface Request {
            /** Authenticated user payload. Null when accessed via public/extractUser fallback */
            user?: { id: UserId } | null;
        }
    }
}
