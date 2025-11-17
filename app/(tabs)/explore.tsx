import { ThemedView } from "@/components/themed-view";
import { PhotoGalleryView } from "@/components/gallery/photo-gallery-view";
import { PhotoGalleryHeader } from "@/components/gallery/photo-gallery-header";
import { PhotoDetailModal } from "@/components/gallery/photo-detail-modal";
import { PhotoLocationGroupModal } from "@/components/gallery/photo-location-group-modal";
import { usePhotos } from "@/hooks/use-photos";
import { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Photo } from "@/types/photo";
import { useRouter } from "expo-router";
import { navigationStore } from "@/store/navigation-store";

export default function GalleryScreen() {
  const router = useRouter();
  const {
    photos,
    loading,
    hasPermission,
    requestPermission,
    photoCount,
  } = usePhotos();

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [groupPhotos, setGroupPhotos] = useState<Photo[]>([]);
  const [groupLocationName, setGroupLocationName] = useState<string | undefined>();
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);

  const handlePhotoPress = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setTimeout(() => setSelectedPhoto(null), 300);
  };

  const handleShowOnMap = (photo: Photo) => {
    // Set the focused photo in the navigation store
    navigationStore.setFocusedPhoto(photo);
    // Navigate to map tab (index)
    router.push("/");
  };

  const handleGroupPress = (photos: Photo[], locationName?: string) => {
    setGroupPhotos(photos);
    setGroupLocationName(locationName);
    setIsGroupModalVisible(true);
  };

  const handleCloseGroupModal = () => {
    setIsGroupModalVisible(false);
    setTimeout(() => {
      setGroupPhotos([]);
      setGroupLocationName(undefined);
    }, 300);
  };

  const handlePhotoSelectFromGroup = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsModalVisible(true);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <PhotoGalleryHeader photoCount={0} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#0080ffff" />
          <Text style={styles.loadingText}>Fotos werden geladen...</Text>
        </View>
      </ThemedView>
    );
  }

  if (!hasPermission) {
    return (
      <ThemedView style={styles.container}>
        <PhotoGalleryHeader photoCount={0} />
        <View style={styles.centerContent}>
          <IconSymbol
            name="photo.fill"
            size={80}
            color="#CCCCCC"
          />
          <Text style={styles.permissionTitle}>
            Zugriff auf Fotos benötigt
          </Text>
          <Text style={styles.permissionText}>
            Geo-Snap benötigt Zugriff auf deine Galerie, um Fotos mit Standorten zu verknüpfen.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.permissionButtonText}>
              Zugriff erlauben
            </Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <PhotoGalleryHeader photoCount={photoCount} />
      {photos.length === 0 ? (
        <View style={styles.centerContent}>
          <IconSymbol
            name="photo.fill"
            size={80}
            color="#CCCCCC"
          />
          <Text style={styles.emptyTitle}>Keine Fotos mit Standort gefunden</Text>
          <Text style={styles.emptyText}>
            Diese App zeigt nur Fotos an, die GPS-Standortdaten enthalten.
          </Text>
          <Text style={styles.emptyHint}>
            💡 Tipp: Aktiviere in deiner Kamera-App die Standort-Speicherung, damit neue Fotos hier erscheinen.
          </Text>
        </View>
      ) : (
        <PhotoGalleryView
          photos={photos}
          onPhotoPress={handlePhotoPress}
          onGroupPress={handleGroupPress}
        />
      )}

      <PhotoDetailModal
        photo={selectedPhoto}
        visible={isModalVisible}
        onClose={handleCloseModal}
        onShowOnMap={handleShowOnMap}
      />

      <PhotoLocationGroupModal
        photos={groupPhotos}
        locationName={groupLocationName}
        visible={isGroupModalVisible}
        onClose={handleCloseGroupModal}
        onPhotoSelect={handlePhotoSelectFromGroup}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
  permissionTitle: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
  },
  permissionText: {
    marginTop: 12,
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
  },
  permissionButton: {
    marginTop: 24,
    backgroundColor: "#0080ffff",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyTitle: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
  },
  emptyHint: {
    marginTop: 16,
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
});
