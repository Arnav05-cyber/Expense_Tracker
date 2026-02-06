import { View, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import CustomBox from "@/components/Box";
import CustomText from "@/components/CustomText";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/Config";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const checkLoginStatus = async () => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const response = await fetch(`${API_URL}/ping`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
        "X-requested-with": "XMLHttpRequest",
      },
    });
    if (response.ok) {
      // If ping works, we might want to auto-redirect.
      // But let's stick to the requested flow.
      const data = await response.json();
      if (data.userId) {
        await AsyncStorage.setItem("userId", data.userId);
      }
    }
    return response.ok;
  };

  const goToHomeWithLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    console.log("Attempting login with:", userName);
    try {
      const response = await fetch(`${API_URL}/auth/v1/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-requested-with": "XMLHttpRequest",
        },
        body: JSON.stringify({
          userName: userName,
          password: password,
        }),
      });

      console.log("Login response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful, tokens received");
        await AsyncStorage.setItem("accessToken", data["accessToken"]);
        await AsyncStorage.setItem("refreshToken", data["token"]);
        await AsyncStorage.setItem("userName", userName);

        // Fetch userId via ping
        try {
          const pingRes = await fetch(`${API_URL}/ping`, {
            headers: { Authorization: "Bearer " + data["accessToken"] },
          });
          if (pingRes.ok) {
            const pingData = await pingRes.json();
            await AsyncStorage.setItem("userId", pingData.userId);
            console.log("UserId saved:", pingData.userId);
          }
        } catch (e) {
          console.error("Failed to fetch userId on login", e);
        }

        // Instant redirect
        router.replace("/Home");
      } else {
        console.error("Login failed with status:", response.status);
        const errorText = await response.text();
        console.error("Error details:", errorText);
        alert(`Login Failed: ${response.status}\n${errorText}`);
      }
    } catch (error) {
      console.error("Login fetch error:", error);
      alert("Network Error: Could not connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_URL}/auth/v1/refreshToken`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-requested-with": "XMLHttpRequest",
        },
        body: JSON.stringify({
          refreshToken: refreshToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data["token"]) {
          await AsyncStorage.setItem("accessToken", data["accessToken"]);
          await AsyncStorage.setItem("refreshToken", data["token"]);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("RefreshToken error:", error);
      return false;
    }
  };

  useEffect(() => {
    const handleLogin = async () => {
      // Auto-login logic
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        // We can verify token validity here if needed
        // For now, let's allow explicit login if needed, or redirect if valid
        // The user specifically asked "when i click login button".
        // Existing logic had auto-redirect.
      }
    };
    // handleLogin(); // Keeping auto-login disabled to prioritize explicit user flow testing if desired, or re-enable?
    // User asked "login button should work".
    // I will leave existing auto-login logic if it works, but verify it doesn't block the UI.
    // Actually, let's Simplify. If valid session, go Home.
    const checkSession = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        // Optional: validate token
        router.replace("/Home");
      }
    };
    checkSession();
  }, []);

  return (
    <View style={styles.loginContainer}>
      <CustomBox style={loginBox}>
        <CustomText style={styles.heading}>Login</CustomText>
        <TextInput
          placeholder="User Name"
          value={userName}
          onChangeText={setUserName}
          style={styles.input}
          placeholderTextColor={"black"}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          showSoftInputOnFocus={true}
          placeholderTextColor={"black"}
        />
      </CustomBox>
      <Pressable
        style={[styles.buttonContainer, isLoading && { opacity: 0.5 }]}
        onPress={() => goToHomeWithLogin()}
        disabled={isLoading}
      >
        <CustomBox style={buttonBox}>
          <CustomText style={styles.buttonText}>
            {isLoading ? "Logging in..." : "Submit"}
          </CustomText>
        </CustomBox>
      </Pressable>
      <Pressable
        style={styles.buttonContainer}
        onPress={() => router.push("/SignUp")}
      >
        <CustomBox style={buttonBox}>
          <CustomText style={styles.buttonText}>Signup</CustomText>
        </CustomBox>
      </Pressable>
    </View>
  );
};

export default Login;

const loginBox = {
  mainBox: {
    backgroundColor: "white",
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 2,
    padding: 20,
    minWidth: 280,
  },

  shadowBox: {
    backgroundColor: "black",
    borderRadius: 10,
  },
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: "100%",
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },

  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    marginTop: 20,
  },
  buttonText: {
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
