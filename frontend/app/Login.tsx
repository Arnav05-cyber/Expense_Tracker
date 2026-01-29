import { View, StyleSheet, TextInput, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import CustomBox from "@/components/Box";
import CustomText from "@/components/CustomText";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setIsLoggedIn] = useState(false);

  const isLoggedIn = async () => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const response = await fetch("http://localhost:9898/ping", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
        "X-requested-with": "XMLHttpRequest",
      },
    });
    return response.ok;
  };

  const refreshToken = async () => {
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    const response = await fetch("http://localhost:9898/auth/v1/refreshToken", {
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
      await AsyncStorage.setItem("accessToken", data["accessToken"]);
      await AsyncStorage.setItem("refreshToken", data["refreshToken"]);
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      console.log(refreshToken);
    }
    return response.ok;
  };

  useEffect(() => {
    const handleLogin = async () => {
      const loggedIn = await isLoggedIn();
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        router.push("/Home");
      } else {
        const refreshed = await refreshToken();
        setIsLoggedIn(refreshed);
        if (refreshed) {
          router.push("/Home");
        }
      }
    };
    handleLogin();
  }, []);
  return (
    <View style={styles.loginContainer}>
      <CustomBox style={loginBox}>
        <CustomText style={styles.heading}>Login</CustomText>
        <TextInput
          placeholder="User Name"
          value={userName}
          onChangeText={(text) => {
            setUserName(text);
          }}
          style={styles.input}
          placeholderTextColor={"black"}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
          }}
          style={styles.input}
          secureTextEntry
          showSoftInputOnFocus={true}
          placeholderTextColor={"black"}
        />
      </CustomBox>
      <Pressable
        style={styles.buttonContainer}
        onPress={() => console.log("Submit")}
      >
        <CustomBox style={buttonBox}>
          <CustomText style={styles.buttonText}>Submit</CustomText>
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
