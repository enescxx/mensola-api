import { IUser } from "@/types/user";

/*
==========================================================================
                    DATA TRANSFER OBJECTS (DTOs)
==========================================================================
*/

/**
 * Payload required for registering a new user.
 * Picks 'username' and 'email' from IUser and requires a raw 'password'.
 */
type CreateUserDto = Pick<IUser, "username" | "email"> & { password: string };

/**
 * Payload required for user authentication/login.
 */
type LoginUserDto = Pick<IUser, "email"> & { password: string };

/**
 * Payload required to issue a new access token using a refresh token.
 */
type TokenRefreshDto = { refreshToken: string };

/**
 * Payload required to revoke an active user session.
 */
type LogoutDto = { refreshToken: string };

/**
 * Payload required to initiate the password reset process via email.
 */
type SendResetEmailDto = Pick<IUser, "email">;

/**
 * Payload required to verify the 6-digit OTP code sent for password reset.
 */
type VerifyCodeDto = Pick<IUser, "email"> & { code: string };

/**
 * Payload required to set a new password using a single-use reset ticket.
 */
type UpdatePasswordDto = { ticket: string; newPassword: string };

/*
==========================================================================
                    SERVICE RESPONSE TYPES
========================================================================== 
*/

/**
 * Response payload returned after successful user registration.
 */
interface CreateUserResponse {
    user: IUser;
    accessToken: string;
    refreshToken: string;
}

/**
 * Response payload returned after successful user login.
 */
interface LoginUserResponse {
    user: IUser;
    accessToken: string;
    refreshToken: string;
}

/**
 * Response payload returned after a successful token refresh operation.
 */
type TokenRefreshResponse = { accessToken: string };

/**
 * Response payload returned after successful OTP code verification,
 * providing a temporary reset ticket.
 */
type VerifyCodeResponse = { ticket: string };

export {
    CreateUserDto,
    LoginUserDto,
    TokenRefreshDto,
    LogoutDto,
    SendResetEmailDto,
    VerifyCodeDto,
    UpdatePasswordDto,
    CreateUserResponse,
    LoginUserResponse,
    TokenRefreshResponse,
    VerifyCodeResponse
};
