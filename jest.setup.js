// AsyncStorage is a native module, so importing it under Jest throws unless the
// library's own mock is registered first.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
