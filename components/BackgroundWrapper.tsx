import React, { ReactNode } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

interface Props {
  children: ReactNode;
}

export default function BackgroundWrapper({ children }: Props) {
  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      style={styles.background}
      blurRadius={2}
    >
      <View style={styles.overlay}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: "cover" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
});
