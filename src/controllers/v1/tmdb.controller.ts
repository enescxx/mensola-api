import { tmdbService } from "@/services/tmdb.service";
import { TypedRequestQuery } from "@/types/express.types";
import { ApiError } from "@/utils/error";
import { sendResponse } from "@/utils/response";
import { NextFunction, Response } from "express";

export const tmdbSearchMovie = async (
    req: TypedRequestQuery<Partial<{ query: string; page: number }>>,
    res: Response,
    next: NextFunction,
) => {
    const query = req.query.query;
    const page = Number(req.query.page) || 1;

    if (!query) {
        return next(new ApiError("MISSING_REQUIRED_FIELDS"));
    }

    try {
        const tmdbResult = await tmdbService.searchMovie(query, page);
        return sendResponse(res, 200, tmdbResult);
    } catch (error) {
        next(error);
    }
};
