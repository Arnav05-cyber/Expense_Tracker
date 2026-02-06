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
import { router, useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/Config";

const SignUp = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigateToLoginScreen = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-requested-with": "XMLHttpRequest",
        },
        body: JSON.stringify({
          firstName: firstname,
          lastName: lastname,
          email: email,
          phoneNumber: phonenumber,
          userName: username,
          password: password,
        }),
      });

      const text = await response.text();
      console.log("Raw Signup Response:", text);

      if (response.ok) {
        console.log("Signup successful");
        const data = JSON.parse(text);
        await AsyncStorage.setItem("accessToken", data["accessToken"]);
        await AsyncStorage.setItem("refreshToken", data["token"]);

        // Fetch userId via ping
        try {
          const pingRes = await fetch(`${API_URL}/ping`, {
            headers: { Authorization: "Bearer " + data["accessToken"] },
          });
          if (pingRes.ok) {
            const pingData = await pingRes.json();
            if (pingData.userId) {
              await AsyncStorage.setItem("userId", pingData.userId);
            }
          }
        } catch (e) {
          console.error("Failed to fetch userId on signup", e);
        }

        // Instant redirect to Home
        router.replace("/Home");
      } else {
        console.error("Signup failed:", text);
        alert("Signup Failed: " + text);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Network Error: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <CustomBox style={signupBox}>
          <CustomText style={styles.heading}>Signup</CustomText>
          <TextInput
            placeholder="First Name"
            value={firstname}
            onChangeText={setFirstname}
            style={styles.input}
            placeholderTextColor={"black"}
          />
          <TextInput
            placeholder="Last Name"
            value={lastname}
            onChangeText={setLastname}
            style={styles.input}
            placeholderTextColor={"black"}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor={"black"}
          />
          <TextInput
            placeholder="Phone Number"
            value={phonenumber}
            onChangeText={setPhonenumber}
            style={styles.input}
            placeholderTextColor={"black"}
          />
          <TextInput
            placeholder="User Name"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholderTextColor={"black"}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            placeholderTextColor={"black"}
          />
        </CustomBox>

        <Pressable
          style={[styles.buttonContainer, isLoading && { opacity: 0.5 }]}
          onPress={navigateToLoginScreen}
          disabled={isLoading}
        >
          <CustomBox style={buttonBox}>
            <CustomText style={styles.buttonText}>
              {isLoading ? "Signing up..." : "Submit"}
            </CustomText>
          </CustomBox>
        </Pressable>

        <Pressable style={styles.buttonContainer} onPress={() => router.back()}>
          <CustomBox style={buttonBox}>
            <CustomText style={styles.buttonText}>Login</CustomText>
          </CustomBox>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default SignUp;

const signupBox = {
  mainBox: {
    backgroundColor: "white",
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 2,
    padding: 20,
    width: "100%",
    minWidth: 300,
  },

  shadowBox: {
    backgroundColor: "black",
    borderRadius: 10,
  },
};

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
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
  buttonContainer: {
    marginTop: 20,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
  },
});
