import { AppRegistry } from "react-native";
import backgroundSmsTask from "./services/BackgroundSms";
import "expo-router/entry";

// Register the Headless JS Task
AppRegistry.registerHeadlessTask("BackgroundSms", () => backgroundSmsTask);
