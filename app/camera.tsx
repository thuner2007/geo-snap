import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function CameraScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.text}>Camera Feature - In Development</Text>
      <Text style={styles.subtext}>
        Wird von einem anderen Team-Mitglied entwickelt
      </Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "600",
  },
  subtext: {
    fontSize: 14,
    color: "#666666",
    marginTop: 8,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#666666",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeIcon: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "300",
  },
});
