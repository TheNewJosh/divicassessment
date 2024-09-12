import type { Config } from "@jest/types";

// Jest configuration options
const config: Config.InitialOptions = {
  preset: "ts-jest", // Use ts-jest preset
  testEnvironment: "node", // Set test environment to Node.js
  transform: {
    "^.+\\.tsx?$": "ts-jest", // Use ts-jest for .ts and .tsx files
  },
  moduleFileExtensions: ["ts", "tsx", "js", "json", "node"], // File extensions for modules
};

export default config;
