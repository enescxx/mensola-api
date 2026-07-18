/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src", "<rootDir>/tests"],
    setupFiles: ["dotenv/config"],
    forceExit: true,
    clearMocks: true,
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"]
};
