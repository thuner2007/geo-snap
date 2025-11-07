import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PhotoMapView } from "@/components/map/photo-map-view";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/themed-text";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <PhotoMapView
        photos={[]}
        onMarkerPress={(photo) => {
          console.log("Photo pressed:", photo.id);
        }}
      />

      <View style={styles.infoBox}>
        <ThemedText style={styles.infoText}>
          📍 Gehe zu "Meine Fotos" um deine Galerie zu laden
        </ThemedText>
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/camera")}
        activeOpacity={0.8}
      >
        <IconSymbol name="camera.fill" size={28} color="#ffffff" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoBox: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 128, 255, 0.9)",
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    color: "#ffffff",
    fontSize: 14,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0080ffff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
