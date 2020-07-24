module.exports = {
    "rootDir": "./",
    "preset": "ts-jest",
    "testEnvironment": "node",
    "setupFilesAfterEnv": ["./build/tests/config/dotenv-config.js"],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    },
    "collectCoverageFrom": [
      "src/**/*.{ts,js}",      
      "!<rootDir>/src/errors/**/*.{ts,js}",
      "!<rootDir>/src/endpoints/**/*.{ts,js}",
      "!<rootDir>/src/utils/*.{ts,js}",
      "!<rootDir>/src/setup/*.{ts,js}"
    ],
  };
  