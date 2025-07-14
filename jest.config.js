module.exports = {
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest", // Added ts/tsx just in case
  },
  moduleNameMapper: {
    "\\.(css|scss|sass)$": "identity-obj-proxy", // Simplified regex
  },
  transformIgnorePatterns: [
    "/node_modules/", // Default, but good to be explicit
  ],
  setupFilesAfterEnv: ["./jest.setup.js"],
  testEnvironment: "jsdom",
};