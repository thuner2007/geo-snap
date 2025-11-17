import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PhotoMapView } from "@/components/map/photo-map-view";
import { PhotoDetailModal } from "@/components/gallery/photo-detail-modal";
import { PhotoLocationGroupModal } from "@/components/gallery/photo-location-group-modal";
import { useRouter, useFocusEffect } from "expo-router";
import { usePhotos } from "@/hooks/use-photos";
import { useState, useCallback, useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Photo } from "@/types/photo";
import { navigationStore } from "@/store/navigation-store";

export default function HomeScreen() {
  const router = useRouter();
  const { photos } = usePhotos();

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [groupPhotos, setGroupPhotos] = useState<Photo[]>([]);
  const [groupLocationName, setGroupLocationName] = useState<string | undefined>();
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [focusedPhoto, setFocusedPhoto] = useState<Photo | null>(null);

  // Subscribe to navigation store for focused photo from other tabs
  useEffect(() => {
    const unsubscribe = navigationStore.subscribe((photo) => {
      setFocusedPhoto(photo);
    });
    return unsubscribe;
  }, []);

  // Check if there's a photo to focus on when tab gains focus
  useFocusEffect(
    useCallback(() => {
      const photo = navigationStore.getFocusedPhoto();
      if (photo) {
        setFocusedPhoto(photo);
        // Clear after using it
        setTimeout(() => {
          navigationStore.clearFocusedPhoto();
        }, 1500);
      }
    }, [])
  );

  const handleMarkerPress = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setTimeout(() => setSelectedPhoto(null), 300);
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

  const handleShowOnMap = (photo: Photo) => {
    setFocusedPhoto(photo);
  };

  return (
    <ThemedView style={styles.container}>
      <PhotoMapView
        photos={photos}
        onMarkerPress={handleMarkerPress}
        onGroupPress={handleGroupPress}
        focusedPhoto={focusedPhoto}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/camera")}
        activeOpacity={0.8}
      >
        <IconSymbol name="camera.fill" size={28} color="#ffffff" />
      </TouchableOpacity>

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
