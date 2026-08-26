import { betaService } from "@/services/beta.service";
import { TypedRequestBody } from "@/types/express.types";
import { sendResponse } from "@/utils/response";
import { NextFunction, Response } from "express";

export const applyBeta = async (
    req: TypedRequestBody<{ firstname?: string; email: string; platform: "android" | "ios" }>,
    res: Response,
    next: NextFunction,
) => {
    const firstname = req.body?.firstname;
    const email = req.body?.email;
    const platform = req.body?.platform;

    try {
        await betaService.applyBeta(email, platform, firstname);
        sendResponse(res, 201, null);
    } catch (error) {
        next(error);
    }
};
