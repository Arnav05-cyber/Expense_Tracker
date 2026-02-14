import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/Config";
import { DeviceEventEmitter } from "react-native";

// This function must be distinct and not use any UI hooks
const backgroundSmsTask = async (taskData: any) => {
  console.log("[BackgroundSms] Received task data:", taskData);

  // taskData should contain the SMS message details passed from Native side
  // { message: "...", sender: "..." }
  const { message } = taskData;

  if (!message) return;

  try {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) {
      console.log("[BackgroundSms] No userId found in storage");
      return;
    }

    console.log(`[BackgroundSms] Sending to API for user ${userId}`);

    const response = await fetch(`${API_URL}/v1/ds/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        user_id: userId,
      }),
    });

    if (response.ok) {
      console.log("[BackgroundSms] Successfully processed SMS");
      // Notify UI to refresh
      DeviceEventEmitter.emit("SMS_PROCESSED");
    } else {
      console.error("[BackgroundSms] API Error:", await response.text());
    }
  } catch (error) {
    console.error("[BackgroundSms] Error:", error);
  }
};

export default backgroundSmsTask;
