import { Redirect } from "expo-router";
import { MMKVLoader, create } from "react-native-mmkv-storage";

// Initialize MMKV storage instance
const MMKV = new MMKVLoader().initialize();

// Export custom hook for persistent state management
export const useStorage = create(MMKV);

export default function App() {
  return <Redirect href="/Home" />;
}
