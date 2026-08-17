import express, { Request, Response } from "express";

import authRoutes from "@/routes/auth.routes";
import userRoutes from "@/routes/user.routes";
import movieRoutes from "@/routes/movie.routes";
import bookmarkRoutes from "@/routes/bookmark.routes";
import trackRoutes from "@/routes/track.routes";
import playlistRoutes from "@/routes/playlist.routes";
import albumRoutes from "@/routes/album.routes";

import { globalErrorHandler } from "@/middlewares/error.middleware";

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
