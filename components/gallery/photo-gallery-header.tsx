import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";

interface PhotoGalleryHeaderProps {
  photoCount: number;
}

export function PhotoGalleryHeader({ photoCount }: PhotoGalleryHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <IconSymbol name="photo.fill" size={24} color={Colors["light"].tint} />
        <Text style={styles.title}>Meine Fotos</Text>
      </View>
      <Text style={styles.count}>{photoCount} Fotos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors["light"].text,
  },
  count: {
    fontSize: 16,
    fontWeight: "400",
    color: "#888888",
  },
});
