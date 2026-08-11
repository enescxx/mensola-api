import { Response, NextFunction } from "express";
import { sendResponse } from "@/utils/response";

import {
    createUser,
    loginUser,
    tokenRefresh,
    userLogout,
    sendResetEmail,
    verifyCode,
    updatePassword
} from "@/services/auth";

import {
    CreateUserDto,
    LoginUserDto,
    TokenRefreshDto,
    LogoutDto,
    SendResetEmailDto,
    VerifyCodeDto,
    UpdatePasswordDto
} from "@/types/auth";
import { TypedRequestBody } from "@/types/express";

/**
 * Handles user registration
 */
const register = async (req: TypedRequestBody<CreateUserDto>, res: Response, next: NextFunction) => {
    try {
        const responseData = await createUser(req.body);
        return sendResponse(res, 201, responseData, "User registered successfully.");
    } catch (error: any) {
        next(error);
    }
};

/**
 * Handles user authentication
 */
const login = async (req: TypedRequestBody<LoginUserDto>, res: Response, next: NextFunction) => {
    try {
        const responseData = await loginUser(req.body);
        return sendResponse(res, 200, responseData, "Login successful.");
    } catch (error) {
        next(error);
    }
};

/**
 * Issues a new access token using a valid refresh token
 */
const refresh = async (req: TypedRequestBody<TokenRefreshDto>, res: Response, next: NextFunction) => {
    try {
        const responseData = await tokenRefresh(req.body);
        return sendResponse(res, 200, responseData);
    } catch (error) {
        next(error);
    }
};

/**
 * Revokes user session and logs out
 */
const logout = async (req: TypedRequestBody<LogoutDto>, res: Response, next: NextFunction) => {
    try {
        await userLogout(req.body);
        return sendResponse(res, 200, null, "Logged out successfully.");
    } catch (error) {
        next(error);
    }
};

/**
 * Initiates password reset flow by sending OTP code
 */
const forgotPassword = async (req: TypedRequestBody<SendResetEmailDto>, res: Response, next: NextFunction) => {
    try {
        await sendResetEmail(req.body);
        return sendResponse(res, 200, null, "If this email address is registered, a reset code has been sent.");
    } catch (error) {
        next(error);
    }
};

/**
 * Verifies OTP code and returns a reset ticket
 */
const verifyResetCode = async (req: TypedRequestBody<VerifyCodeDto>, res: Response, next: NextFunction) => {
    try {
        const responseData = await verifyCode(req.body);
        return sendResponse(res, 200, responseData);
    } catch (error) {
        next(error);
    }
};

/**
 * Updates password using valid verification ticket
 */
const resetPassword = async (req: TypedRequestBody<UpdatePasswordDto>, res: Response, next: NextFunction) => {
    try {
        await updatePassword(req.body);
        return sendResponse(
            res,
            200,
            null,
            "Your password has been successfully updated. Please log in with your new password."
        );
    } catch (error) {
        next(error);
    }
};

export { register, login, refresh, logout, forgotPassword, verifyResetCode, resetPassword };
