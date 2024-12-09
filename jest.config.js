export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": "babel-jest", // Transpile TypeScript and JavaScript files
  },
  moduleFileExtensions: ["ts", "js", "json", "jsx", "tsx", "node"], // Supported extensions
  transformIgnorePatterns: ["<rootDir>/node_modules/"], // Exclude node_modules from transformation
  setupFiles: ["<rootDir>/jest.setup.js"], // Carga variables antes de ejecutar los tests
};
