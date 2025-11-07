import React from "react";
import { View, StyleSheet, Image } from "react-native";

interface PhotoMarkerProps {
  imageUri?: string;
  size?: number;
}

export function PhotoMarker({ imageUri, size = 40 }: PhotoMarkerProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.marker, { width: size, height: size, borderRadius: size / 2 }]}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, { borderRadius: (size - 6) / 2 }]}
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      <View style={styles.pointer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    backgroundColor: "#0080ffff",
    borderWidth: 3,
    borderColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "60%",
    height: "60%",
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#ffffff",
    marginTop: -1,
  },
});
