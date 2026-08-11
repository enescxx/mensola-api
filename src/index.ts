import app from "./app";
import pool from "./config/db";
import { initDatabase } from "./scripts/initDb";

const port = process.env.PORT || 3000;

initDatabase(pool)
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error("Failed to initialize database:", err);
    });
