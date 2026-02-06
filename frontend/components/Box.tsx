import { StyleSheet, View, ViewStyle } from "react-native";
import React from "react";
import { Box } from "@/components/ui/box";

interface CustomBoxProps {
  style?: any;
  children?: React.ReactNode;
  [key: string]: any;
}

const CustomBox = ({ style = {}, children, ...props }: CustomBoxProps) => {
  return (
    <View>
      <Box style={[styles.headingContainer, style.mainBox]} {...props}>
        <View style={styles.textColor}>{children}</View>
      </Box>
      <Box style={[styles.shadowContainer, style.shadowBox]} {...props}></Box>
    </View>
  );
};

export default CustomBox;

const styles = StyleSheet.create({
  headingContainer: {
    padding: 20,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "black",
    position: "relative",
  },
  textColor: {
    // color: "white", // Gluestack Box might handle color differently or use text color
  },
  shadowContainer: {
    position: "absolute",
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
    backgroundColor: "grey",
    zIndex: -1,
  },
});
