module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.spec.ts'],
    rootDir: "src",
    moduleNameMapper: {
      "@/(.*)$": "<rootDir>/$1",
    }
  };