import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PhotoMapView } from "@/components/map/photo-map-view";
import { useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as Location from "expo-location";

interface Photo {
  id: string;
  uri: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface PhotosByLocation {
  location: string;
  photos: Photo[];
  latitude: number;
  longitude: number;
}

const { width } = Dimensions.get("window");
const PHOTO_SIZE = (width - 48) / 3;

export default function ExploreScreen() {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosByLocation, setPhotosByLocation] = useState<PhotosByLocation[]>([]);
  const [hasMediaPermission, setHasMediaPermission] = useState<boolean | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Tippe auf den Button um zu starten");

  const requestPermissions = async () => {
    try {
      setStatusMessage("🔐 Frage Berechtigungen an...");
      console.log("🔐 Requesting permissions (Expo Go mode)...");

      // SKIP Media Library permission request entirely for Expo Go
      // Just set to true and try direct access
      console.log("📷 Skipping media permission request (Expo Go workaround)...");
      setHasMediaPermission(true);

      // Location permission - this one works in Expo Go
      console.log("📍 Requesting location permission...");
      try {
        const locationStatus = await Location.requestForegroundPermissionsAsync();
        console.log("📍 Location permission:", locationStatus);
        setHasLocationPermission(locationStatus.status === "granted");

        if (locationStatus.status !== "granted") {
          setStatusMessage("❌ Standort-Berechtigung verweigert");
          Alert.alert(
            "Berechtigung erforderlich",
            "Bitte erlaube den Zugriff auf deinen Standort in den Einstellungen."
          );
          return false;
        }
      } catch (locError) {
        console.error("❌ Location permission error:", locError);
        setHasLocationPermission(false);
        return false;
      }

      setStatusMessage("✅ Bereit zum Laden!");
      return true;
    } catch (error) {
      console.error("❌ Permission error:", error);
      setStatusMessage("⚠️ Expo Go Modus - versuche trotzdem...");
      setHasMediaPermission(true);
      return true;
    }
  };

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      setStatusMessage("📸 Lade Fotos...");
      console.log("📸 Loading photos...");

      let media;
      try {
        console.log("📸 Attempting direct media library access (no permission request)...");

        // Try to access media library directly without requesting permissions
        // This may work in Expo Go with limited access
        media = await MediaLibrary.getAssetsAsync({
          mediaType: "photo",
          sortBy: ["creationTime"],
          first: 100,
        });
        console.log("✅ Successfully loaded photos without explicit permission!");
      } catch (mediaError) {
        console.error("❌ Media library error:", mediaError);
        console.error("Error details:", JSON.stringify(mediaError));
        setStatusMessage("❌ Expo Go kann nicht auf Galerie zugreifen");

        Alert.alert(
          "Expo Go Einschränkung",
          "⚠️ Aufgrund von Android Einschränkungen kann Expo Go nicht mehr voll auf die Media Library zugreifen.\n\n" +
          "Google hat ab Android 13 die Berechtigungen geändert.\n\n" +
          "Lösung: Erstelle einen Development Build:\n" +
          "npm run dev:android\n\n" +
          "oder\n\n" +
          "Nutze die Kamera in der App um neue Fotos mit Standort zu erstellen.",
          [{ text: "OK" }]
        );
        setIsLoading(false);
        return;
      }

      console.log(`📸 Found ${media.assets.length} total photos`);
      console.log("📸 First photo sample:", media.assets[0]);
      setStatusMessage(`📸 ${media.assets.length} Fotos gefunden, prüfe Standortdaten...`);

      const photosWithLocation: Photo[] = [];

      for (const asset of media.assets) {
        try {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
          console.log(`📸 Photo ${asset.id} info:`, {
            hasLocation: !!assetInfo.location,
            location: assetInfo.location,
            uri: assetInfo.uri,
          });

          if (assetInfo.location) {
            photosWithLocation.push({
              id: asset.id,
              uri: asset.uri,
              latitude: assetInfo.location.latitude,
              longitude: assetInfo.location.longitude,
              timestamp: asset.creationTime || Date.now(),
            });
          }
        } catch (err) {
          console.log("⚠️ Could not get location for photo:", asset.id, err);
        }
      }

      console.log(`📍 Found ${photosWithLocation.length} photos with location`);
      setPhotos(photosWithLocation);

      if (photosWithLocation.length === 0) {
        setStatusMessage(`⚠️ Keine Fotos mit Standortdaten gefunden (${media.assets.length} Fotos gesamt)`);
        Alert.alert(
          "Keine GPS-Fotos",
          `Von ${media.assets.length} Fotos haben 0 Standortdaten.\n\nIn Expo Go kann dies ein bekanntes Problem sein. Für volle Funktionalität:\n\nnpm run dev:ios (oder dev:android)`
        );
      } else {
        setStatusMessage(`✅ ${photosWithLocation.length} Fotos mit Standort geladen`);
        await groupPhotosByLocation(photosWithLocation);
      }
    } catch (error) {
      console.error("❌ Error loading photos:", error);
      setStatusMessage("❌ Fehler beim Laden: " + error);
      Alert.alert("Fehler", "Fotos konnten nicht geladen werden: " + JSON.stringify(error));
    } finally {
      setIsLoading(false);
    }
  };

  const groupPhotosByLocation = async (photoList: Photo[]) => {
    console.log(`🗺️ Grouping ${photoList.length} photos...`);
    const LOCATION_THRESHOLD = 0.001;
    const groups: PhotosByLocation[] = [];

    for (const photo of photoList) {
      let foundGroup = false;

      for (const group of groups) {
        const latDiff = Math.abs(group.latitude - photo.latitude);
        const lonDiff = Math.abs(group.longitude - photo.longitude);

        if (latDiff < LOCATION_THRESHOLD && lonDiff < LOCATION_THRESHOLD) {
          group.photos.push(photo);
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        let locationName = "Unbekannter Ort";
        try {
          const results = await Location.reverseGeocodeAsync({
            latitude: photo.latitude,
            longitude: photo.longitude,
          });

          if (results.length > 0) {
            const result = results[0];
            locationName =
              result.city ||
              result.district ||
              result.subregion ||
              result.region ||
              "Unbekannter Ort";
          }
        } catch {
          console.log("⚠️ Could not geocode location");
        }

        groups.push({
          location: locationName,
          photos: [photo],
          latitude: photo.latitude,
          longitude: photo.longitude,
        });
      }
    }

    groups.sort((a, b) => b.photos.length - a.photos.length);
    console.log(`✅ Created ${groups.length} location groups`);
    setPhotosByLocation(groups);
  };

  const handleStart = async () => {
    const hasPermissions = await requestPermissions();
    if (hasPermissions) {
      await loadPhotos();
    }
  };

  const renderLocationGroup = ({ item }: { item: PhotosByLocation }) => (
    <View style={styles.locationGroup}>
      <View style={styles.locationHeader}>
        <IconSymbol name="location.fill" size={20} color="#0080ff" />
        <ThemedText style={styles.locationName}>{item.location}</ThemedText>
        <ThemedText style={styles.photoCount}>
          {item.photos.length} {item.photos.length === 1 ? "Foto" : "Fotos"}
        </ThemedText>
      </View>
      <View style={styles.photoGrid}>
        {item.photos.slice(0, 6).map((photo, index) => (
          <TouchableOpacity
            key={photo.id}
            style={styles.photoItem}
            onPress={() => console.log("Photo pressed:", photo.id)}
          >
            <Image source={{ uri: photo.uri }} style={styles.photoImage} />
            {index === 5 && item.photos.length > 6 && (
              <View style={styles.moreOverlay}>
                <ThemedText style={styles.moreText}>
                  +{item.photos.length - 6}
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStartScreen = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="photo.on.rectangle" size={64} color="#0080ff" />
      <ThemedText style={styles.emptyTitle}>Galerie laden</ThemedText>
      <ThemedText style={styles.statusText}>{statusMessage}</ThemedText>

      {/* Debug Info */}
      <View style={styles.debugInfo}>
        <ThemedText style={styles.debugText}>
          📷 Galerie: {hasMediaPermission === null ? "⏳" : hasMediaPermission ? "✅" : "❌"}
        </ThemedText>
        <ThemedText style={styles.debugText}>
          📍 Standort: {hasLocationPermission === null ? "⏳" : hasLocationPermission ? "✅" : "❌"}
        </ThemedText>
        <ThemedText style={styles.debugText}>
          📸 Fotos: {photos.length}
        </ThemedText>
        <ThemedText style={styles.debugText}>
          🗺️ Orte: {photosByLocation.length}
        </ThemedText>
      </View>

      <TouchableOpacity
        style={[styles.startButton, isLoading && styles.buttonDisabled]}
        onPress={handleStart}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <ThemedText style={styles.startButtonText}>
            Berechtigungen anfordern & Fotos laden
          </ThemedText>
        )}
      </TouchableOpacity>

      {photos.length === 0 && hasMediaPermission && hasLocationPermission && !isLoading && (
        <View style={styles.noPhotosInfo}>
          <ThemedText style={styles.infoText}>
            ℹ️ Keine Fotos mit Standortdaten gefunden.
          </ThemedText>
          <ThemedText style={styles.infoTextSmall}>
            Nur Fotos die mit aktiviertem GPS aufgenommen wurden, werden angezeigt.
          </ThemedText>
        </View>
      )}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>Meine Fotos</ThemedText>
        {photos.length > 0 && (
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === "list" && styles.toggleButtonActive]}
              onPress={() => setViewMode("list")}
            >
              <IconSymbol name="list.bullet" size={20} color={viewMode === "list" ? "#0080ff" : "#666"} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === "map" && styles.toggleButtonActive]}
              onPress={() => setViewMode("map")}
            >
              <IconSymbol name="map.fill" size={20} color={viewMode === "map" ? "#0080ff" : "#666"} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      {photos.length === 0 ? (
        renderStartScreen()
      ) : viewMode === "map" ? (
        <PhotoMapView photos={photos} onMarkerPress={(photo) => console.log("Photo:", photo.id)} />
      ) : (
        <FlatList
          data={photosByLocation}
          renderItem={renderLocationGroup}
          keyExtractor={(item, index) => `location-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleStart} />}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: "#ffffff",
  },
  listContent: {
    padding: 16,
  },
  locationGroup: {
    marginBottom: 24,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  locationName: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  photoCount: {
    fontSize: 14,
    color: "#666",
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  photoItem: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  moreOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  moreText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
  },
  statusText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  debugInfo: {
    padding: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    width: "100%",
    marginVertical: 8,
  },
  debugText: {
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginBottom: 4,
  },
  startButton: {
    backgroundColor: "#0080ff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  noPhotosInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    width: "100%",
  },
  infoText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  infoTextSmall: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
  },
});
