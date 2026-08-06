/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src", "<rootDir>/tests"],
    setupFiles: ["dotenv/config"],
    forceExit: true,
    clearMocks: true,
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    moduleNameMapper: {
        "^@/types/(.*)$": ["<rootDir>/src/types/$1.types", "<rootDir>/src/types/$1"],
        "^@/utils/(.*)$": "<rootDir>/src/utils/$1",
        "^@/config/(.*)$": "<rootDir>/src/config/$1",
        "^@/controllers/(.*)$": ["<rootDir>/src/controllers/$1.controller", "<rootDir>/src/controllers/$1"],
        "^@/services/(.*)$": ["<rootDir>/src/services/$1.service", "<rootDir>/src/services/$1"],
        "^@/routes/(.*)$": ["<rootDir>/src/routes/$1.routes", "<rootDir>/src/routes/$1"],
        "^@/validations/(.*)$": ["<rootDir>/src/validations/$1.validation", "<rootDir>/src/validations/$1"],
        "^@/middlewares/(.*)$": ["<rootDir>/src/middlewares/$1.middleware", "<rootDir>/src/middlewares/$1"],
        "^@/queries/(.*)$": ["<rootDir>/src/queries/$1.queries", "<rootDir>/src/queries/$1"],
        "^@/(.*)$": "<rootDir>/src/$1",
    },
};
