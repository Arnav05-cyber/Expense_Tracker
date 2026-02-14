import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import React, { useCallback, useState } from "react";
import CustomBox from "@/components/Box";
import CustomText from "@/components/CustomText";
import { router, useFocusEffect, Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/Config";
import SmsAndroid from "react-native-get-sms-android";
import { PermissionsAndroid, Platform, DeviceEventEmitter } from "react-native";

const Home = () => {
  const [userName, setUserName] = useState("User");
  const [totalExpenses, setTotalExpenses] = useState("0.00");
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [smsText, setSmsText] = useState("");
  const [processingSms, setProcessingSms] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setAuthError(false);
    try {
      const storedUserName = await AsyncStorage.getItem("userName");
      if (storedUserName) setUserName(storedUserName);

      const userId = await AsyncStorage.getItem("userId");
      const accessToken = await AsyncStorage.getItem("accessToken");

      if (!userId || !accessToken) {
        console.log("No userId or token found");
        setAuthError(true);
        return;
      }

      console.log("Fetching expenses for userId:", userId);
      const response = await fetch(`${API_URL}/expense/v1/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Expenses fetched:", data.length);

        const sorted = data.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setRecentExpenses(sorted.slice(0, 5));

        const total = data.reduce(
          (sum: number, item: any) => sum + item.amount,
          0,
        );
        setTotalExpenses(total.toFixed(2));
      } else {
        console.error("Failed to fetch expenses:", response.status);
        if (response.status === 403 || response.status === 401) {
          setAuthError(true);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // setTotalSpent helper since I removed the explicit setter in state for brevity above but need it
  // Wait, I replaced the whole file content so I should be careful.
  // I need to define setTotalExpenses again correctly.

  // Re-defining state properly

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  // Listen for Native SMS Events (Foreground)
  React.useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "SMS_RECEIVED",
      (event) => {
        console.log("Foreground SMS Received:", event);
        if (event && event.message) {
          // Simple check to avoid processing junk
          const transactionKeywords = [
            "debited",
            "spent",
            "paid",
            "sent",
            "transfer",
          ];
          const isRelevant = transactionKeywords.some((keyword) =>
            event.message.toLowerCase().includes(keyword),
          );

          if (isRelevant) {
            processSmsText(event.message);
          }
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Listen for Background Task Success (to refresh UI)
  React.useEffect(() => {
    const subscription = DeviceEventEmitter.addListener("SMS_PROCESSED", () => {
      console.log("Received SMS_PROCESSED event - Refreshing Data");
      fetchData();
      Alert.alert("New Expense", "Expense added automatically from SMS!");
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const handleLogout = async () => {
    // Calling backend logout if possible, but for now just clear local
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        await fetch(`${API_URL}/auth/v1/logout`, {
          method: "POST",
          headers: { Authorization: "Bearer " + token },
        });
      }
    } catch (e) {
      console.error("Logout error", e);
    }

    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("userId");
    await AsyncStorage.removeItem("userName");
    await AsyncStorage.setItem("hasLoggedOut", "true");
    router.replace("/Login");
  };

  if (authError) {
    return (
      <View style={[styles.container, styles.center]}>
        <CustomText style={styles.errorText}>
          Session Expired or Invalid
        </CustomText>
        <Pressable onPress={handleLogout} style={styles.loginButton}>
          <CustomBox style={buttonBox}>
            <CustomText style={styles.buttonText}>Go to Login</CustomText>
          </CustomBox>
        </Pressable>
      </View>
    );
  }

  const processSmsText = async (text: string) => {
    if (!text.trim()) return;

    try {
      const token = await AsyncStorage.getItem("accessToken");
      const userId = await AsyncStorage.getItem("userId");

      console.log("Sending SMS to DS Service:", {
        user_id: userId,
        message: text,
      });

      const response = await fetch(`${API_URL}/v1/ds/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          user_id: userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert(
          "Success",
          `Expense extracted: ${data.amount} ${data.currency} at ${data.merchant}`,
        );
        setSmsText("");
        setModalVisible(false);
        fetchData();
      } else {
        const txt = await response.text();
        Alert.alert("Error", "Failed to process SMS: " + txt);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Network error processing SMS");
    }
  };

  const requestSmsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      ]);

      return (
        granted[PermissionsAndroid.PERMISSIONS.READ_SMS] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const syncSmsExpenses = async () => {
    if (Platform.OS !== "android") {
      Alert.alert("Not Supported", "SMS reading is only available on Android.");
      return;
    }

    const hasPermission = await requestSmsPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Cannot read SMS without permission.");
      return;
    }

    setProcessingSms(true);

    const filter = {
      box: "inbox",
      maxCount: 20,
    };

    SmsAndroid.list(
      JSON.stringify(filter),
      (fail: string) => {
        setProcessingSms(false);
        console.log("Failed with this error: " + fail);
        Alert.alert("Error", "Failed to access SMS inbox");
      },
      async (count: number, smsList: string) => {
        console.log("Count: ", count);
        const arr = JSON.parse(smsList);

        const transactionKeywords = [
          "debited",
          "spent",
          "paid",
          "sent",
          "transfer",
        ];
        const relevantSms = arr.find((sms: any) =>
          transactionKeywords.some((keyword) =>
            sms.body.toLowerCase().includes(keyword),
          ),
        );

        if (relevantSms) {
          await processSmsText(relevantSms.body);
        } else {
          Alert.alert("No New Expenses", "No recent transaction SMS found.");
        }
        setProcessingSms(false);
      },
    );
  };

  const handleSmsSubmit = async () => {
    if (!smsText.trim()) return;
    setProcessingSms(true);
    await processSmsText(smsText);
    setProcessingSms(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Pressable onPress={syncSmsExpenses} style={{ marginRight: 15 }}>
                <CustomText style={{ color: "white", fontSize: 14 }}>
                  Sync SMS
                </CustomText>
              </Pressable>

              <Pressable
                onPress={() => setModalVisible(true)}
                style={{ marginRight: 15 }}
              >
                <CustomText style={{ color: "white", fontSize: 14 }}>
                  Manual
                </CustomText>
              </Pressable>
              <Pressable
                onPress={() => router.push("/Profile" as any)}
                style={{ marginRight: 10 }}
              >
                <CustomText style={{ color: "white", fontSize: 14 }}>
                  Profile
                </CustomText>
              </Pressable>
            </View>
          ),
        }}
      />

      {/* SMS Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <CustomText style={styles.modalTitle}>Paste Bank SMS</CustomText>
            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={4}
              placeholder="Paste transaction SMS here..."
              value={smsText}
              onChangeText={setSmsText}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.buttonClose]}
                onPress={() => setModalVisible(false)}
              >
                <CustomText style={styles.textStyle}>Cancel</CustomText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.buttonSubmit]}
                onPress={handleSmsSubmit}
                disabled={processingSms}
              >
                <CustomText style={styles.textStyle}>
                  {processingSms ? "Processing..." : "Extract"}
                </CustomText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <CustomBox style={sectionBox}>
          <CustomText style={styles.welcomeText}>Hello, {userName}!</CustomText>
          <CustomText style={styles.dateText}>
            {new Date().toDateString()}
          </CustomText>
        </CustomBox>

        {/* Balance Card */}
        <CustomBox style={balanceBox}>
          <CustomText style={styles.balanceLabel}>Total Expenses</CustomText>
          {loading ? (
            <CustomText style={styles.balanceAmount}>...</CustomText>
          ) : (
            <CustomText style={styles.balanceAmount}>
              ₹{totalExpenses}
            </CustomText>
          )}
        </CustomBox>

        {/* Actions Grid */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push("/AddExpense" as any)}
          >
            <CustomBox style={actionBox}>
              <CustomText style={styles.actionText}>+ Add</CustomText>
            </CustomBox>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() => router.push("/Analytics" as any)}
          >
            <CustomBox style={actionBox}>
              <CustomText style={styles.actionText}>Analytics</CustomText>
            </CustomBox>
          </Pressable>
        </View>

        {/* Recent Activity */}
        <CustomBox style={recentBox}>
          <CustomText style={styles.sectionTitle}>Recent Activity</CustomText>
          {loading ? (
            <CustomText>Loading...</CustomText>
          ) : recentExpenses.length === 0 ? (
            <View style={styles.emptyState}>
              <CustomText style={styles.emptyText}>No expenses yet.</CustomText>
            </View>
          ) : (
            recentExpenses.map((expense, index) => (
              <View key={index} style={styles.expenseItem}>
                <View>
                  <CustomText style={styles.merchantText}>
                    {expense.merchant}
                  </CustomText>
                  <CustomText style={styles.dateSmallText}>
                    {new Date(expense.created_at).toLocaleDateString()}
                  </CustomText>
                </View>
                <CustomText style={styles.amountText}>
                  ₹{expense.amount.toFixed(2)}
                </CustomText>
              </View>
            ))
          )}
        </CustomBox>

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          style={{ marginTop: 20, alignItems: "center", marginBottom: 20 }}
        >
          <CustomText
            style={{
              color: "red",
              textDecorationLine: "underline",
              fontWeight: "bold",
            }}
          >
            Log Out
          </CustomText>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default Home;

const sectionBox = {
  mainBox: {
    backgroundColor: "white",
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 2,
    padding: 20,
    marginBottom: 20,
  },
  shadowBox: {
    backgroundColor: "black",
    borderRadius: 10,
  },
};

const balanceBox = {
  mainBox: {
    backgroundColor: "#e0e7ff",
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 2,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  shadowBox: {
    backgroundColor: "black",
    borderRadius: 10,
  },
};

const actionBox = {
  mainBox: {
    backgroundColor: "white",
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 2,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  shadowBox: {
    backgroundColor: "black",
    borderRadius: 10,
  },
};

const recentBox = {
  mainBox: {
    backgroundColor: "white",
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 2,
    padding: 20,
    minHeight: 200,
  },
  shadowBox: {
    backgroundColor: "black",
    borderRadius: 10,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  balanceLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "900",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    width: "48%",
  },
  actionText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "black",
    paddingBottom: 5,
    alignSelf: "flex-start",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  emptyText: {
    color: "#888",
    fontStyle: "italic",
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  merchantText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dateSmallText: {
    fontSize: 12,
    color: "#666",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    color: "red",
  },
  loginButton: {
    marginTop: 10,
  },
  buttonText: {
    fontWeight: "bold",
  },
  // Modal Styles
  modalCenteredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: "top",
    backgroundColor: "#f9f9f9",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: "45%",
    alignItems: "center",
  },
  buttonClose: {
    backgroundColor: "#ff4d4d",
  },
  buttonSubmit: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

const buttonBox = {
  mainBox: {
    backgroundColor: "white",
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 2,
    paddingVertical: 10,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  shadowBox: {
    backgroundColor: "black",
    borderRadius: 10,
  },
};
