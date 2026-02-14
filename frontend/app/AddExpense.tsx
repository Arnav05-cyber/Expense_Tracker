import {
  StyleSheet,
  TextInput,
  View,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState } from "react";
import CustomBox from "@/components/Box";
import CustomText from "@/components/CustomText";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/Config";

const AddExpense = () => {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddExpense = async () => {
    if (!merchant || !amount) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const userId = await AsyncStorage.getItem("userId");

      if (!token || !userId) {
        Alert.alert("Error", "Session expired. Please login again.");
        router.replace("/Login");
        return;
      }

      const response = await fetch(`${API_URL}/expense/v1/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          merchant,
          amount: parseFloat(amount),
          currency,
          user_id: userId,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Expense added successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        const errorText = await response.text();
        Alert.alert("Error", `Failed to add expense: ${errorText}`);
      }
    } catch (error) {
      console.error("Add Expense Error:", error);
      Alert.alert("Error", "Failed to add expense due to network error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <CustomBox style={formBox}>
          <CustomText style={styles.heading}>Add Expense</CustomText>

          <CustomText style={styles.label}>Merchant</CustomText>
          <TextInput
            placeholder="e.g. Starbucks"
            value={merchant}
            onChangeText={setMerchant}
            style={styles.input}
            placeholderTextColor="#666"
          />

          <CustomText style={styles.label}>Amount</CustomText>
          <TextInput
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#666"
          />

          <CustomText style={styles.label}>Currency</CustomText>
          <TextInput
            placeholder="INR"
            value={currency}
            onChangeText={setCurrency}
            style={styles.input}
            placeholderTextColor="#666"
            editable={false} // Keeping it simple for now as requested
          />
        </CustomBox>

        <Pressable
          style={[styles.buttonContainer, isLoading && { opacity: 0.5 }]}
          onPress={handleAddExpense}
          disabled={isLoading}
        >
          <CustomBox style={buttonBox}>
            <CustomText style={styles.buttonText}>
              {isLoading ? "Adding..." : "Add Expense"}
            </CustomText>
          </CustomBox>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default AddExpense;

const formBox = {
  mainBox: {
    backgroundColor: "white",
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 2,
    padding: 20,
    width: "100%",
  },
  shadowBox: {
    backgroundColor: "black",
    borderRadius: 10,
  },
};

const buttonBox = {
  mainBox: {
    backgroundColor: "#e0e7ff",
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 2,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: "center",
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
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    width: "100%",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonContainer: {
    marginTop: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
