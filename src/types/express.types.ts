import { Request } from "express";

/**
 * Custom Request type to strictly infer req.body
 */
export type TypedRequestBody<T> = Request<{}, {}, T>;

/**
 * Custom Request type for URL query parameters (e.g. req.query)
 */
export type TypedRequestQuery<Q> = Request<{}, {}, {}, Q>;

/**
 * Flexible Typed Request to support Params, ResBody, ReqBody, and ReqQuery
 */
export type TypedRequest<Params = {}, ReqBody = {}, ReqQuery = {}> = Request<Params, {}, ReqBody, ReqQuery>;
