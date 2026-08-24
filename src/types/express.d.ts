import "multer";
import { UserId } from "@/types/common.types";

declare global {
    namespace Express {
        interface Request {
            /** Authenticated user payload. Null when accessed via public/extractUser fallback */
            user?: { id: UserId } | null;
        }
    }
}
