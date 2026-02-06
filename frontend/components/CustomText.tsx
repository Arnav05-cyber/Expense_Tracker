import { StyleSheet, Text, View, TextProps } from "react-native";
import React from "react";

interface CustomTextProps extends TextProps {
  style?: any;
  children: React.ReactNode;
}

const CustomText = ({ style = {}, children, ...props }: CustomTextProps) => {
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
