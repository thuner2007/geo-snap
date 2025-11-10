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

interface PhotoGalleryViewProps {
  photos?: Photo[];
  onPhotoPress?: (photo: Photo) => void;
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
}: PhotoGalleryViewProps) {
  const renderItem = ({ item, index }: { item: Photo; index: number }) => {
    const backgroundColor =
      GRADIENT_COLORS[index % GRADIENT_COLORS.length];

    return (
      <TouchableOpacity
        style={[styles.photoCard]}
        onPress={() => onPhotoPress?.(item)}
        activeOpacity={0.9}
      >
        {item.uri ? (
          <Image
            source={{ uri: item.uri }}
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
        data={photos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
