import React from "react";
import { View, StyleSheet, Image, Text } from "react-native";

interface PhotoMarkerProps {
  imageUri?: string;
  size?: number;
  count?: number;
}

export function PhotoMarker({ imageUri, size = 40, count }: PhotoMarkerProps) {
  const borderWidth = 3;

  const getBadgeColor = () => {
    if (!count || count <= 1) return "#007AFF";
    if (count <= 3) return "#FF3B30";
    if (count <= 10) return "#FF9500";
    if (count <= 50) return "#007AFF";
    return "#5856D6";
  };

  const badgeColor = getBadgeColor();
  const markerColor = count && count > 1 ? badgeColor : "#007AFF";

  // WICHTIG: Container muss grösser sein als marker wegen badge!
  const containerSize = size + 20;

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      <View
        style={[
          styles.marker,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth,
            borderColor: "#FFFFFF",
            backgroundColor: markerColor,
          },
        ]}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[
              styles.image,
              {
                width: size - borderWidth * 2,
                height: size - borderWidth * 2,
                borderRadius: (size - borderWidth * 2) / 2,
              },
            ]}
          />
        ) : (
          <View style={styles.placeholder} />
        )}

        {count && count > 1 && (
          <View style={[styles.countBadge, { backgroundColor: badgeColor }]}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
  countBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  countText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
  },
});
