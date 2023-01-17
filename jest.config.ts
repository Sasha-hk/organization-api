import { Config } from 'jest';

const config: Config = {
  roots: ['./test'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 30000,
  moduleNameMapper: {
    '^@Shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@Module/(.*)$': '<rootDir>/src/modules/$1',
    '^@Src/(.*)$': '<rootDir>/src/$1',
    '^@Test/(.*)$': '<rootDir>/test/$1',
  },
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test|e2e-spec).[jt]s?(x)'],
  preset: 'ts-jest',
};

export default config;
