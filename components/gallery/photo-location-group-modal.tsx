import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Photo } from "@/types/photo";

interface PhotoLocationGroupModalProps {
  photos: Photo[];
  locationName?: string;
  visible: boolean;
  onClose: () => void;
  onPhotoSelect: (photo: Photo) => void;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const PHOTO_SIZE = (SCREEN_WIDTH - 48) / 3; // 3 columns with padding

export function PhotoLocationGroupModal({
  photos,
  locationName,
  visible,
  onClose,
  onPhotoSelect,
}: PhotoLocationGroupModalProps) {
  if (photos.length === 0) return null;

  const renderPhoto = ({ item }: { item: Photo }) => {
    return (
      <TouchableOpacity
        style={styles.photoItem}
        onPress={() => {
          onClose();
          setTimeout(() => onPhotoSelect(item), 300);
        }}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.uri }}
          style={styles.photoImage}
          contentFit="cover"
        />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.locationName} numberOfLines={2}>
                {locationName || "Dieser Standort"}
              </Text>
              <View style={styles.countBadge}>
                <IconSymbol
                  name="photo.fill"
                  size={14}
                  color="#0080ffff"
                />
                <Text style={styles.countText}>
                  {photos.length}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Photo Grid */}
          <FlatList
            data={photos}
            renderItem={renderPhoto}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            style={styles.grid}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    flex: 1,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  locationName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  countText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0080ffff",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    fontSize: 18,
    color: "#666666",
    fontWeight: "600",
  },

  grid: {
    paddingHorizontal: 16,
  },
  gridContent: {
    paddingBottom: 20,
  },
  photoItem: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    margin: 4,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F0F0F0",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
});
