import React from "react";
import { StyleSheet, View, Pressable, Linking } from "react-native";
import { Link, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomBox from "@/components/Box";
import CustomText from "@/components/CustomText";

const LandingPage = () => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        const hasLoggedOut = await AsyncStorage.getItem("hasLoggedOut");

        if (accessToken) {
          // Valid session exists -> Go to Home
          router.replace("/Home");
        } else if (hasLoggedOut === "true") {
          // User explicitly logged out previously -> Go to Login
          router.replace("/Login");
        } else {
          // First time or session expired naturally -> Show Landing Page
          setLoading(false);
        }
      } catch (e) {
        console.error("Session check failed", e);
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err),
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <CustomText>Loading...</CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
        <CustomText style={styles.title}>Expense Tracker App</CustomText>

        <View style={styles.buttonContainer}>
          {/* Changed Link to explicit router.push for reliability */}
          <Pressable
            style={styles.buttonWrapper}
            onPress={() => router.push("/Login")}
          >
            <CustomBox style={primaryButtonBox}>
              <CustomText style={[styles.buttonText, { color: "white" }]}>
                Login
              </CustomText>
            </CustomBox>
          </Pressable>

          <Link href="/SignUp" asChild>
            <Pressable style={styles.buttonWrapper}>
              <CustomBox style={secondaryButtonBox}>
                <CustomText style={styles.buttonText}>Sign Up</CustomText>
              </CustomBox>
            </Pressable>
          </Link>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <CustomText style={styles.footerText}>Connect with me:</CustomText>
        <View style={styles.linkContainer}>
          <Pressable
            onPress={() => openLink("https://github.com/Arnav05-cyber")}
          >
            <CustomText style={styles.linkText}>GitHub</CustomText>
          </Pressable>
          <CustomText style={styles.separator}>|</CustomText>
          <Pressable
            onPress={() => openLink("https://www.instagram.com/arnavvyas_/")}
          >
            <CustomText style={styles.linkText}>Instagram</CustomText>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default LandingPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "900", // Extra bold
    marginBottom: 50,
    textAlign: "center",
    color: "#050a30", // Using the theme color
  },
  buttonContainer: {
    width: "100%",
    gap: 20,
    alignItems: "center",
  },
  buttonWrapper: {
    width: "80%",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    paddingBottom: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    marginBottom: 10,
    color: "#666",
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#050a30", // Theme color
    textDecorationLine: "underline",
  },
  separator: {
    fontSize: 16,
    color: "#ccc",
  },
});

const primaryButtonBox = {
  mainBox: {
    backgroundColor: "#050a30", // Theme color
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 2,
    paddingVertical: 15,
    alignItems: "center",
  },
  shadowBox: {
    backgroundColor: "black",
    borderRadius: 10,
  },
};

// Slightly lighter color or inverted for secondary, but user asked for buttons.
// Let's make it white with blue text to differentiate.
const secondaryButtonBox = {
  mainBox: {
    backgroundColor: "white",
    borderColor: "#050a30",
    borderRadius: 10,
    borderWidth: 2,
    paddingVertical: 15,
    alignItems: "center",
  },
  shadowBox: {
    backgroundColor: "black",
    borderRadius: 10,
  },
};
