import express, { Request, Response } from "express";

import v1Routes from "@/routes/v1";

import { globalErrorHandler } from "@/middlewares/error.middleware";

const app = express();

app.use(express.json());

app.use("/v1", v1Routes);

app.use(globalErrorHandler);

app.get("/", (req: Request, res: Response) => {
    res.send("Server is running successfully");
});

export default app;
