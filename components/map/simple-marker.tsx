import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SimpleMarkerProps {
  count?: number;
}

export function SimpleMarker({ count }: SimpleMarkerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.text}>{count || "📍"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF3B30",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
