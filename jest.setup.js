const testPool = require("./tests/testDb").default || require("./tests/testDb");
const { runMigrations } = require("./src/scripts/migrate");

jest.mock("@/config/db", () => {
    return require("./tests/testDb");
});

beforeAll(async () => {
    try {
        await testPool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
        await runMigrations(testPool);
    } catch (err) {
        console.warn("Database connection not available; skipping DB migration setup for unit tests.");
    }
});

afterAll(async () => {
    try {
        await testPool.end();
    } catch (err) {}
});
