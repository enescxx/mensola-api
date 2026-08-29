import app from "@/app";
import { initCleanupUsersJob } from "@/jobs/cleanupUsers.job";

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    initCleanupUsersJob();
});
