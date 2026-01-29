import Constants from "expo-constants";
import { Platform } from "react-native";

const localhost = Platform.OS === "ios" ? "localhost" : "10.0.2.2";

const getApiUrl = () => {
  // If running in development with Expo Go, use the host IP of the machine running Metro
  if (Constants.expoConfig?.hostUri) {
    const origin = Constants.expoConfig.hostUri.split(":").shift();
    return `http://${origin}:8000`;
  }

  // Fallback for simulators/production if no hostUri is found
  return `http://${localhost}:8000`;
};

export const API_URL = getApiUrl();
