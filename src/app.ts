import cors from "cors";
import express, { Request, Response } from "express";

import v1Routes from "@/routes/v1";

import { globalErrorHandler } from "@/middlewares/error.middleware";
import { i18nMiddleware } from "@/middlewares/i18n.middleware";

const app = express();

app.use(cors());
app.use(express.json());
app.use(i18nMiddleware);

app.use("/v1", v1Routes);

app.use(globalErrorHandler);

app.get("/", (req: Request, res: Response) => {
    res.send("Server is running successfully");
});

export default app;
