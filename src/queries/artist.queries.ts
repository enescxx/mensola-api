export const artistQueries = {
    checkExists: `
        SELECT *
        FROM "Artist" a
        WHERE a."spotifyId" = $1`,

    insertArtist: `
        INSERT INTO "Artist" ("spotifyId", name, image, "createdAt")
        VALUES ($1, $2, $3, NOW())
        RETURNING id`,
};
