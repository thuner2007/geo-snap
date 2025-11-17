import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import { Image } from "expo-image";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Photo } from "@/types/photo";
import { PhotoGroup, groupPhotosByLocationName } from "@/lib/photo-grouping";

interface PhotoGalleryViewProps {
  photos?: Photo[];
  onPhotoPress?: (photo: Photo) => void;
  onGroupPress?: (photos: Photo[], locationName?: string) => void;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const COLUMNS = 3;
const SPACING = 1;
const ITEM_SIZE = (SCREEN_WIDTH - SPACING * (COLUMNS + 1)) / COLUMNS;

const GRADIENT_COLORS = [
  "#5CA6E8", // Blue
  "#4ECB71", // Green
  "#A77BCA", // Purple
  "#FF9955", // Orange
  "#6B4423", // Brown
  "#E8E8E8", // Light Grey
  "#CCCCCC", // Grey
  "#999999", // Dark Grey
];

export function PhotoGalleryView({
  photos = [],
  onPhotoPress,
  onGroupPress,
}: PhotoGalleryViewProps) {
  // Group photos by location name
  const photoGroups = React.useMemo(() => {
    return groupPhotosByLocationName(photos);
  }, [photos]);

  const renderItem = ({ item, index }: { item: PhotoGroup; index: number }) => {
    const backgroundColor = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
    const photoCount = item.photos.length;
    const firstPhoto = item.photos[0];

    const handlePress = () => {
      if (photoCount === 1) {
        // Single photo - open detail modal directly
        onPhotoPress?.(firstPhoto);
      } else {
        // Multiple photos - open group selection modal
        onGroupPress?.(item.photos, item.locationName);
      }
    };

    return (
      <TouchableOpacity
        style={[styles.photoCard]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {firstPhoto.uri ? (
          <Image
            source={{ uri: firstPhoto.uri }}
            style={styles.photoImage}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              styles.placeholderContainer,
              { backgroundColor },
            ]}
          >
            <IconSymbol
              name="photo.fill"
              size={60}
              color="rgba(255, 255, 255, 0.5)"
            />
          </View>
        )}

        {/* Photo count badge (only show if more than 1 photo) */}
        {photoCount > 1 && (
          <View style={styles.countBadge}>
            <IconSymbol name="photo.stack" size={16} color="#ffffff" />
            <Text style={styles.countText}>{photoCount}</Text>
          </View>
        )}

        {/* Location name overlay */}
        {item.locationName && (
          <View style={styles.locationOverlay}>
            <IconSymbol
              name="location.fill"
              size={14}
              color="#ffffff"
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.locationName}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={photoGroups}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.locationName}-${index}`}
        numColumns={COLUMNS}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  gridContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 0,
  },
  row: {
    justifyContent: "flex-start",
    marginBottom: 0,
  },
  photoCard: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.3,
    margin: SPACING / 2,
    borderRadius: 0,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  countBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  countText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  locationOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
});
