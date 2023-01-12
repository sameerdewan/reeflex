module.exports = {
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  testMatch: ["**/__tests__/**/*.js?(x)", "**/?(*.)+(spec|test).js?(x)"],
  setupFilesAfterEnv: ["@babel/preset-env"],
  testEnvironment: "jest-environment-jsdom"
};
