const testPool = require("./tests/testDb").default || require("./tests/testDb");
const { runMigrations } = require("./src/scripts/migrate");

jest.mock("@/config/db", () => {
    return require("./tests/testDb");
});

beforeAll(async () => {
    await testPool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
    await runMigrations(testPool);
});

afterAll(async () => {
    await testPool.end();
});
