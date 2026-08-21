import { spotifyService } from "@/services/spotify.service";
import { PaginationQueries } from "@/types/common.types";
import { TypedRequestQuery } from "@/types/express.types";
import { ApiError } from "@/utils/error";
import { sendResponse } from "@/utils/response";
import { NextFunction, Response } from "express";

export const spotifySearchTrack = async (
    req: TypedRequestQuery<Partial<PaginationQueries & { query: string }>>,
    res: Response,
    next: NextFunction,
) => {
    const { query, page, limit } = req.query;

    if (!query) {
        return next(new ApiError("MISSING_REQUIRED_FIELDS"));
    }

    try {
        const searchResponse = await spotifyService.searchTracks(query, page, limit);
        return sendResponse(res, 200, searchResponse);
    } catch (error) {
        next(error);
    }
};
