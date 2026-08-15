import { Request } from "express";

/**
 * Custom Request type to strictly infer req.body
 */
export type TypedRequestBody<T> = Request<Record<string, string>, unknown, T>;

/**
 * Custom Request type for URL query parameters (req.query)
 */
export type TypedRequestQuery<Q> = Request<Record<string, string>, unknown, unknown, Q>;

/**
 * Flexible Typed Request to support Params, ResBody, ReqBody, and ReqQuery
 */
export type TypedRequest<Params = Record<string, string>, ReqBody = unknown, ReqQuery = unknown> = Request<
    Params,
    unknown,
    ReqBody,
    ReqQuery
>;
