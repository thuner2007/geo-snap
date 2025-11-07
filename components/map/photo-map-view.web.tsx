import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface Photo {
  id: string;
  uri: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface PhotoMapViewProps {
  photos?: Photo[];
  onMarkerPress?: (photo: Photo) => void;
}

export function PhotoMapView({ photos = [], onMarkerPress }: PhotoMapViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <IconSymbol name="map.fill" size={64} color="#0080ffff" />
        <Text style={styles.title}>Karten-Ansicht</Text>
        <Text style={styles.subtitle}>
          Die interaktive Karte ist nur in der mobilen App verfügbar.
        </Text>
        <Text style={styles.hint}>
          Öffne Geo-Snap auf deinem iOS oder Android Gerät um deine Fotos auf der Karte zu sehen! 📱
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    maxWidth: 400,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  hint: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
