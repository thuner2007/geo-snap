import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Photo } from "@/types/photo";
import MapView, { Marker } from "react-native-maps";
import * as Sharing from "expo-sharing";
import { navigationStore } from "@/store/navigation-store";
import { useRouter } from "expo-router";

interface PhotoDetailModalProps {
  photo: Photo | null;
  visible: boolean;
  onClose: () => void;
  onShowOnMap?: (photo: Photo) => void;
}

const SCREEN_WIDTH = Dimensions.get("window").width;

export function PhotoDetailModal({
  photo,
  visible,
  onClose,
  onShowOnMap,
}: PhotoDetailModalProps) {
  const router = useRouter();

  if (!photo) return null;

  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          "Teilen nicht verfügbar",
          "Das Teilen wird auf diesem Gerät nicht unterstützt."
        );
        return;
      }

      await Sharing.shareAsync(photo.uri, {
        mimeType: "image/jpeg",
        dialogTitle: `Foto von ${photo.locationName || "Unbekannter Ort"}`,
      });
    } catch (error) {
      console.error("Error sharing photo:", error);
      Alert.alert(
        "Fehler beim Teilen",
        "Das Foto konnte nicht geteilt werden."
      );
    }
  };

  const handleGoHome = () => {
    // Set focused photo in navigation store
    navigationStore.setFocusedPhoto(photo);
    // Close modal
    onClose();
    // Navigate to home/map tab
    setTimeout(() => {
      router.push("/");
    }, 300);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).replace(",", " um") + " Uhr";
  };

  const formatCoordinates = (lat: number, lon: number) => {
    const latDir = lat >= 0 ? "N" : "S";
    const lonDir = lon >= 0 ? "E" : "W";
    return {
      lat: `${Math.abs(lat).toFixed(6)}° ${latDir}`,
      lon: `${Math.abs(lon).toFixed(6)}° ${lonDir}`,
    };
  };

  const coords = formatCoordinates(photo.latitude, photo.longitude);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {photo.locationName || "Unbekannter Ort"}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.8}
              onPress={handleShare}
            >
              <IconSymbol name="paperplane.fill" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.8}
              onPress={handleGoHome}
            >
              <IconSymbol name="house.fill" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {/* Photo Card */}
          <View style={styles.photoCard}>
            <Image
              source={{ uri: photo.uri }}
              style={styles.photoImage}
              contentFit="cover"
            />
          </View>

          {/* Location Name and Date */}
          <View style={styles.infoHeader}>
            <Text style={styles.locationTitle}>
              {photo.locationName || "Unbekannter Ort"}
            </Text>
            <Text style={styles.dateText}>{formatDate(photo.timestamp)}</Text>
          </View>

          {/* Coordinates Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <IconSymbol name="location.fill" size={20} color="#3B82F6" />
              <Text style={styles.cardTitle}>KOORDINATEN</Text>
            </View>
            <Text style={styles.coordinateText}>{coords.lat}</Text>
            <Text style={styles.coordinateText}>{coords.lon}</Text>
          </View>

          {/* Camera Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <IconSymbol name="camera.fill" size={20} color="#10B981" />
              <Text style={styles.cardTitle}>KAMERA INFO</Text>
            </View>
            <Text style={styles.infoText}>Geräteinformationen nicht verfügbar</Text>
          </View>

          {/* File Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.fileIcon}>📄</Text>
              <Text style={styles.cardTitle}>DATEI INFO</Text>
            </View>
            <Text style={styles.infoText}>
              {photo.uri.split("/").pop() || "Unbekannt"}
            </Text>
          </View>

          {/* Mini Map Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <IconSymbol name="map.fill" size={20} color="#F59E0B" />
              <Text style={styles.cardTitle}>STANDORT</Text>
            </View>
            <TouchableOpacity
              style={styles.miniMapContainer}
              onPress={() => {
                if (onShowOnMap) {
                  onClose();
                  setTimeout(() => onShowOnMap(photo), 300);
                }
              }}
              activeOpacity={0.9}
            >
              <MapView
                style={styles.miniMap}
                initialRegion={{
                  latitude: photo.latitude,
                  longitude: photo.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: photo.latitude,
                    longitude: photo.longitude,
                  }}
                  title={photo.locationName}
                />
              </MapView>
            </TouchableOpacity>
            {onShowOnMap && (
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => {
                  onClose();
                  setTimeout(() => onShowOnMap(photo), 300);
                }}
                activeOpacity={0.8}
              >
                <IconSymbol name="map.fill" size={18} color="#000000" />
                <Text style={styles.mapButtonText}>In Karte öffnen</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#000000",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "300",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  photoCard: {
    width: SCREEN_WIDTH - 40,
    height: 280,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#5B9FED",
    marginBottom: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  infoHeader: {
    marginBottom: 24,
  },
  locationTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  infoCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.5,
  },
  coordinateText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: "#D1D5DB",
    lineHeight: 24,
  },
  fileIcon: {
    fontSize: 18,
  },
  miniMapContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  miniMap: {
    width: "100%",
    height: "100%",
  },
  mapButton: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  mapButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
  },
  bottomPadding: {
    height: 40,
  },
});
