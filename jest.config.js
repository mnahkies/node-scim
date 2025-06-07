const inspector = require("node:inspector")

const config = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  resetMocks: true,
  testTimeout: inspector.url() ? 5 * 60 * 1000 : 5 * 1000,
}

module.exports = config
