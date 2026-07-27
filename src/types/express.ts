import { Request } from "express";

/**
 * Custom Request type to strictly infer req.body
 */
export type TypedRequestBody<T> = Request<{}, {}, T>;

/**
 * Custom Request type if you need URL parameters and req.body together
 * Example: req.params.id and req.body
 */
export type TypedRequest<Params = {}, ReqBody = {}> = Request<Params, {}, ReqBody>;
