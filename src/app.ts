import express, { Request, Response } from "express";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
    res.send("Server is running successfully");
});

export default app;
