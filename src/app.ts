import express, { Request, Response } from "express";

import authRoutes from "@/routes/auth";
import userRoutes from "@/routes/user";
import movieRoutes from "@/routes/movie";
import bookmarkRoutes from "@/routes/bookmark";
import trackRoutes from "@/routes/track";
import playlistRoutes from "@/routes/playlist.routes";
import albumRoutes from "@/routes/album.routes";

import { globalErrorHandler } from "@/middlewares/error";

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/tracks", trackRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/albums", albumRoutes);

app.use(globalErrorHandler);

app.get("/", (req: Request, res: Response) => {
    res.send("Server is running successfully");
});

export default app;
