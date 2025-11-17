// Mock expo modules
jest.mock("expo-font");
jest.mock("expo-asset");
jest.mock("expo-symbols", () => ({
  SymbolView: "SymbolView",
}));

// Mock the Expo Winter runtime
global.__ExpoImportMetaRegistry = {
  load: jest.fn(),
  register: jest.fn(),
};

// Mock structuredClone for tests
global.structuredClone = jest.fn((val) => {
  return JSON.parse(JSON.stringify(val));
});
