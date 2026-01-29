import { StyleSheet, Text, View } from "react-native";
import React from "react";

const CustomText = ({ style = {}, children, ...props }) => {
  return (
    <Text style={[styles.text, style]} {...props}>
      {children}
    </Text>
  );
};

export default CustomText;

const styles = StyleSheet.create({
  text: {
    color: "black",
    fontFamily: "Helvetica",
    fontSize: 16,
    fontWeight: "bold",
  },
});
