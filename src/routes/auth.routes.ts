import { Router } from "express";
import {
    register,
    login,
    refresh,
    logout,
    forgotPassword,
    verifyResetCode,
    resetPassword
} from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    verifyResetCodeSchema,
    resetPasswordSchema
} from "../validations/auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshTokenSchema), refresh);
router.post("/logout", logout);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post(
    "/verify-reset-code",
    validate(verifyResetCodeSchema),
    verifyResetCode
);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
