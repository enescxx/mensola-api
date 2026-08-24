import { Router } from "express";

// Controllers
import {
    getMe,
    getUserById,
    updateProfile,
    getUserFollowers,
    getUserFollowing,
    followUser,
    unfollowUser,
} from "@/controllers/v1/user.controller";

// Middlewares
import { verifyToken, extractUser } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";

// Validations
import { userListQuerySchema, userIdParamSchema, updateProfileSchema } from "@/validations/user.validation";
import { requiredUserId } from "@/middlewares/requiredId.middleware";

const router = Router();

/* ==========================================================================
   Current User Profile Routes (/me)
   ========================================================================== */

/**
 * @route   GET /api/users/me
 * @desc    Fetch the authenticated user's own profile details
 * @access  Private (Requires valid Access Token)
 */
router.get("/me", verifyToken, getMe);

/**
 * @route   PATCH /api/users/me
 * @desc    Update authenticated user's profile fields (fullname, bio, avatar)
 * @access  Private (Requires valid Access Token)
 */
router.patch("/me", verifyToken, validate(updateProfileSchema), updateProfile);

/* ==========================================================================
   Social Connections & Graph Routes (Followers / Following)
   ========================================================================== */

/**
 * @route   GET /api/users/followers
 * @desc    Get paginated followers list for a target user (or current user)
 * @access  Public / Optional Auth (Attaches viewer context if authenticated)
 */
router.get("/followers", extractUser, validate(userListQuerySchema), requiredUserId, getUserFollowers);

/**
 * @route   GET /api/users/following
 * @desc    Get paginated following list for a target user (or current user)
 * @access  Public / Optional Auth (Attaches viewer context if authenticated)
 */
router.get("/following", extractUser, validate(userListQuerySchema), requiredUserId, getUserFollowing);

/* ==========================================================================
   Follow & Unfollow Actions
   ========================================================================== */

/**
 * @route   POST /api/users/:userId/follow
 * @desc    Follow a target user by ID
 * @access  Private (Requires valid Access Token)
 */
router.post("/:userId/follow", verifyToken, validate(userIdParamSchema), followUser);

/**
 * @route   DELETE /api/users/:userId/follow
 * @desc    Unfollow a target user by ID
 * @access  Private (Requires valid Access Token)
 */
router.delete("/:userId/follow", verifyToken, validate(userIdParamSchema), unfollowUser);

/* ==========================================================================
   Public Profile Routes
   ========================================================================== */

/**
 * @route   GET /api/users/:userId
 * @desc    Get public profile details by user ID
 * @access  Public / Optional Auth (Includes contextual fields like isFollowingByMe if token provided)
 * @note    Must be placed at the bottom to prevent route matching collisions with static endpoints
 */
router.get("/:userId", extractUser, validate(userIdParamSchema), getUserById);

export default router;
