module.exports = {
  preset: "jest-expo",
  collectCoverage: true,
  //setupFilesAfterEnv: ["<rootDir>/jest/setup.js"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "text-summary", "clover", "json"],
  reporters: [
    "default",
    ["jest-junit", { outputDirectory: "coverage/test-results", outputName: "junit.xml" }]
  ],
};
