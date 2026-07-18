const testPool = require("./tests/testDb").default || require("./tests/testDb");
const { initDatabase } = require("./src/scripts/initDb");

jest.mock("./src/config/db", () => {
    return require("./tests/testDb");
});

beforeAll(async () => {
    await testPool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
    await initDatabase(testPool);
});

afterAll(async () => {
    await testPool.end();
});
