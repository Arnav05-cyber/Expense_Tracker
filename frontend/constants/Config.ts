import Constants from "expo-constants";
import { Platform } from "react-native";

const localhost = Platform.OS === "ios" ? "localhost" : "10.0.2.2";

const getApiUrl = () => {
  // For Android Emulator, always use 10.0.2.2 to reach the host machine
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }

  // If running in development with Expo Go, use the host IP of the machine running Metro
  if (Constants.expoConfig?.hostUri) {
    const origin = Constants.expoConfig.hostUri.split(":").shift();
    return `http://${origin}:8000`;
  }

  return "http://localhost:8000";
};

export const API_URL = getApiUrl();
