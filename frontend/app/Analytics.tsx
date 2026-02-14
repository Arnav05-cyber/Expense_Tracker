import { StyleSheet, View, ScrollView, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import CustomBox from "@/components/Box";
import CustomText from "@/components/CustomText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/Config";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState("0.00");
  const [merchantData, setMerchantData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const userId = await AsyncStorage.getItem("userId");

      if (!token || !userId) return;

      const response = await fetch(`${API_URL}/expense/v1/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        processAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (expenses: any[]) => {
    // Calculate total
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    setTotalSpent(total.toFixed(2));

    // Group by merchant
    const merchantMap: Record<string, number> = {};
    expenses.forEach((item) => {
      const merchant = item.merchant || "Unknown";
      merchantMap[merchant] = (merchantMap[merchant] || 0) + item.amount;
    });

    // Convert to array and sort
    const sortedMerchants = Object.entries(merchantMap)
      .map(([merchant, amount]) => ({ merchant, amount }))
      .sort((a, b) => b.amount - a.amount);

    setMerchantData(sortedMerchants);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <CustomText style={styles.heading}>Spending Overview</CustomText>

        {/* Total Spent Card */}
        <CustomBox style={totalBox}>
          <CustomText style={styles.totalLabel}>Total Spent</CustomText>
          <CustomText style={styles.totalAmount}>₹{totalSpent}</CustomText>
        </CustomBox>

        {/* Merchant Breakdown */}
        <View style={styles.sectionContainer}>
          <CustomText style={styles.sectionTitle}>
            Top Spending by Merchant
          </CustomText>

          {merchantData.length === 0 ? (
            <CustomText style={styles.emptyText}>No expenses found.</CustomText>
          ) : (
            merchantData.map((item, index) => (
              <CustomBox key={index} style={itemBox}>
                <View style={styles.row}>
                  <CustomText style={styles.merchantName}>
                    {item.merchant}
                  </CustomText>
                  <CustomText style={styles.merchantAmount}>
                    ₹{item.amount.toFixed(2)}
                  </CustomText>
                </View>
                {/* Simple progress bar simulation */}
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min((item.amount / parseFloat(totalSpent)) * 100, 100)}%`,
                      },
                    ]}
                  />
                </View>
              </CustomBox>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Analytics;

const totalBox = {
  mainBox: {
    backgroundColor: "#e0e7ff",
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 2,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  shadowBox: {
    backgroundColor: "black",
    borderRadius: 10,
  },
};

const itemBox = {
  mainBox: {
    backgroundColor: "white",
    borderColor: "black",
    borderRadius: 8,
    borderWidth: 1,
    padding: 15,
    marginBottom: 10,
    width: "100%",
  },
  shadowBox: {
    backgroundColor: "#ccc",
    borderRadius: 8,
    top: 3,
    left: 3,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    marginBottom: 5,
    color: "#444",
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "900",
  },
  sectionContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  emptyText: {
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  merchantAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#050a30",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#050a30",
    borderRadius: 4,
  },
});
