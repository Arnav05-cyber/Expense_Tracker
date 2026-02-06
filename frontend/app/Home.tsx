import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import CustomBox from "@/components/Box";
import CustomText from "@/components/CustomText";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/Config";

const Home = () => {
  const [userName, setUserName] = useState("User");
  const [totalExpenses, setTotalExpenses] = useState("0.00");
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]); // Using any for now to avoid interface dupe issues if kept in same file
  const [loading, setLoading] = useState(true);

  const [authError, setAuthError] = useState(false);

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("userId");
    await AsyncStorage.removeItem("userName");
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

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <CustomText style={styles.headerText}>
          Expected Expense Tracker
        </CustomText>
        <Pressable onPress={handleLogout}>
          <CustomText style={styles.logoutText}>Logout</CustomText>
        </Pressable>
      </View>

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
              ${totalExpenses}
            </CustomText>
          )}
        </CustomBox>

        {/* Actions Grid */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={styles.actionButton}
            onPress={() => console.log("Add Expense")}
          >
            <CustomBox style={actionBox}>
              <CustomText style={styles.actionText}>+ Add</CustomText>
            </CustomBox>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() => console.log("View Analytics")}
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
                  ${expense.amount.toFixed(2)}
                </CustomText>
              </View>
            ))
          )}
        </CustomBox>
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
    backgroundColor: "#e0e7ff", // Light indigo/blue tint for contrast
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 2,
    padding: 30, // Bigger padding for emphasis
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
    minHeight: 200, // Give it some height
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
    paddingTop: 50, // For safe area rough estimation
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "900", // Extra bold
  },
  logoutText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  scrollContainer: {
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
