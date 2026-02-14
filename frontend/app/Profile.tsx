import {
  StyleSheet,
  TextInput,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomBox from "@/components/Box";
import CustomText from "@/components/CustomText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/Config";
import { router } from "expo-router";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const id = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("accessToken");

      if (!id || !token) {
        Alert.alert("Error", "Session expired.");
        router.replace("/Login");
        return;
      }
      setUserId(id);

      const response = await fetch(`${API_URL}/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setEmail(data.email || "");
        setPhoneNumber(data.phoneNumber || "");
      } else {
        console.error("Failed to fetch profile:", response.status);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch(`${API_URL}/user/createUpdate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          userId,
          firstName,
          lastName,
          email,
          phoneNumber,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Profile updated successfully");
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    } catch (error) {
      console.error("Save profile error:", error);
      Alert.alert("Error", "Network error");
    } finally {
      setSaving(false);
    }
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
        <CustomBox style={formBox}>
          <CustomText style={styles.heading}>Edit Profile</CustomText>

          <CustomText style={styles.label}>First Name</CustomText>
          <TextInput
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
            placeholderTextColor="#666"
          />

          <CustomText style={styles.label}>Last Name</CustomText>
          <TextInput
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
            placeholderTextColor="#666"
          />

          <CustomText style={styles.label}>Email</CustomText>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor="#666"
            editable={false} // Email usually immutable or requires special flow
          />
          <CustomText style={styles.noteText}>
            Email cannot be changed directly.
          </CustomText>

          <CustomText style={styles.label}>Phone Number</CustomText>
          <TextInput
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.input}
            placeholderTextColor="#666"
          />
        </CustomBox>

        <Pressable
          style={[styles.buttonContainer, saving && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <CustomBox style={buttonBox}>
            <CustomText style={styles.buttonText}>
              {saving ? "Saving..." : "Save Changes"}
            </CustomText>
          </CustomBox>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default Profile;

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
    marginBottom: 5,
    width: "100%",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  noteText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 15,
    fontStyle: "italic",
  },
  buttonContainer: {
    marginTop: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
