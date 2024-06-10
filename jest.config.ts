export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['reflect-metadata'],
  resetMocks: true,
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['__mocks__', '.*\\.test\\.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/', '.*__mocks__.*'],
};
