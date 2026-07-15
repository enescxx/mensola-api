import express, { Request, Response } from "express";
import pool, { initDatabase } from "./config/db";

import authRoutes from "./routes/auth.routes";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
    res.send("Server is running successfully");
});

app.get("/db-test", async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "DB Error" });
    }
});

initDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
});
