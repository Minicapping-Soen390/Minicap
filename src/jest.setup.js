require('dotenv').config();
jest.mock("@expo/vector-icons", () => ({
    Ionicons: "Ionicons",
    MaterialCommunityIcons: "MaterialCommunityIcons",
  }));

