​📸 **GEO-SNAP - Complete Project Breakdown**

### **🎯 What is Geo-Snap?**

Geo-Snap is a **React Native mobile app** built with **Expo** that lets you take photos with GPS location data and view them on an interactive map. Think of it as a photo app that preserves and displays the exact location where each photo was taken.

---

## **📚 LIBRARIES & DEPENDENCIES**

### **Core Framework:**

1. **Expo (~54.0.20)** - The development framework that wraps React Native
2. **React (19.1.0)** - UI library
3. **React Native (0.81.5)** - Mobile framework
4. **expo-router (~6.0.13)** - File-based navigation system

### **Navigation:**

- `@react-navigation/native` - Navigation core
- `@react-navigation/bottom-tabs` - Bottom tab navigation
- `@react-navigation/elements` - Navigation UI components

### **Camera & Media:**

- **expo-camera** - Takes photos with the device camera
- **expo-media-library** - Accesses device photo gallery
- **expo-image** - High-performance image component
- **expo-image-picker** - Picks images from gallery
- **expo-image-manipulator** - Image editing/processing

### **Location Services:**

- **expo-location** - Gets GPS coordinates and reverse geocoding
- **react-native-maps** - Displays interactive maps (uses Google Maps on Android)

### **EXIF (Photo Metadata) Handling:**

- **piexifjs** - JavaScript library to read/write EXIF data
- **exif-js** - Alternative EXIF library
- **exif-media-library (local module)** - **CUSTOM NATIVE MODULE** to preserve GPS in photos

### **UI & Interaction:**

- **expo-haptics** - Vibration feedback
- **react-native-gesture-handler** - Touch gestures (pinch-to-zoom)
- **react-native-reanimated** - Smooth animations
- **expo-symbols** - SF Symbols icons (iOS)
- **@expo/vector-icons** - Material Icons (Android)

### **Other Utilities:**

- **expo-sharing** - Share photos
- **expo-constants** - App constants
- **expo-status-bar** - Status bar styling
- **expo-splash-screen** - Splash screen
- **expo-system-ui** - System UI controls

---

## **🏗️ PROJECT STRUCTURE**

```
geo-snap/
├── app/                    # Screens (Expo Router file-based routing)
│   ├── (tabs)/            # Tab navigation group
│   │   ├── index.tsx      # 🗺️ MAP VIEW (home screen)
│   │   ├── explore.tsx    # 📷 GALLERY VIEW
│   │   └── _layout.tsx    # Tab bar configuration
│   ├── _layout.tsx        # Root navigation layout
│   └── camera.tsx         # 📸 CAMERA SCREEN
├── components/            # Reusable UI components
│   ├── gallery/          # Gallery-related components
│   ├── map/              # Map-related components
│   └── ui/               # Generic UI components
├── hooks/                # Custom React hooks
├── lib/                  # Business logic libraries
├── utils/                # Utility functions
├── types/                # TypeScript type definitions
├── constants/            # App constants (colors, themes)
├── modules/              # Native modules
│   └── exif-media-library/  # 🔥 CUSTOM NATIVE MODULE
└── assets/               # Images, fonts, etc.
```

---

## **📄 LINE-BY-LINE CODE EXPLANATION**

### **1. `app/_layout.tsx` - Root Navigation**

```geo-snap/app/_layout.tsx#L1-L32
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="camera"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
```

**What it does:**

- **Line 1-4**: Imports navigation components
- **Line 6-8**: Sets the default route to the tabs screen
- **Line 10-31**: Defines the app's navigation structure:
  - `(tabs)` - Main tabbed interface (Map & Gallery)
  - `camera` - Camera modal (slides up from bottom)
  - `modal` - Generic modal screen

---

### **2. `app/(tabs)/_layout.tsx` - Tab Bar Configuration**

```geo-snap/app/(tabs)/_layout.tsx#L1-L64
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0080ffff",
        headerShown: true,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => (
            <View style={styles.headerContainer}>
              <IconSymbol
                size={24}
                name="camera.fill"
                color={Colors["light"].tint}
              />
              <Text style={styles.headerText}>Geo-Snap</Text>
            </View>
          ),
          headerTitleAlign: "left",
          tabBarLabel: "Karte",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="map.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          headerTitle: () => (
            <View style={styles.headerContainer}>
              <IconSymbol
                size={24}
                name="photo.fill"
                color={Colors["light"].tint}
              />
              <Text style={styles.headerText}>Meine Fotos</Text>
            </View>
          ),
          headerTitleAlign: "left",
          tabBarLabel: "Galerie",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="photo.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

**What it does:**

- **Line 11-16**: Sets tab bar options (blue color, haptic feedback on tap)
- **Line 18-35**: First tab - **Map View** (index.tsx)
- **Line 36-54**: Second tab - **Gallery View** (explore.tsx)

---

### **3. `app/(tabs)/index.tsx` - Map Screen (Home)**

```geo-snap/app/(tabs)/index.tsx#L1-L79
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PhotoMapView } from "@/components/map/photo-map-view";
import { PhotoDetailModal } from "@/components/gallery/photo-detail-modal";
import { PhotoLocationGroupModal } from "@/components/gallery/photo-location-group-modal";
import { useRouter } from "expo-router";
import { usePhotos } from "@/hooks/use-photos";
import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Photo } from "@/types/photo";

export default function HomeScreen() {
  const router = useRouter();
  const { photos } = usePhotos();

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [groupPhotos, setGroupPhotos] = useState<Photo[]>([]);
  const [groupLocationName, setGroupLocationName] = useState<string | undefined>();
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);

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

  return (
    <ThemedView style={styles.container}>
      <PhotoMapView
        photos={photos}
        onMarkerPress={handleMarkerPress}
        onGroupPress={handleGroupPress}
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
```

**What it does:**

- **Line 14**: Fetches all photos with GPS from gallery using custom hook
- **Line 16-20**: State for modals (single photo detail & grouped photos)
- **Line 52-56**: Displays the map with photo markers
- **Line 57-62**: **Floating Action Button (FAB)** - opens camera
- **Line 64-77**: Two modals for viewing photos

---

### **4. `hooks/use-photos.ts` - Photo Loading Hook**

This is **THE CORE** of the app - it loads photos from the device:

```geo-snap/hooks/use-photos.ts#L1-L110
import { useState, useEffect, useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import { Photo } from '@/types/photo';

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<MediaLibrary.PermissionStatus | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Check existing permissions
  const checkPermission = useCallback(async () => {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      setPermissionStatus(status);
      setHasPermission(status === 'granted');

      // Also check location permission for reverse geocoding
      const locationStatus = await Location.getForegroundPermissionsAsync();
      setHasLocationPermission(locationStatus.granted);

      return status === 'granted';
    } catch (error) {
      console.error('Error checking media library permission:', error);
      return false;
    }
  }, []);

  // Load photos from device media library
  const loadPhotos = useCallback(async () => {
    // Get location name from coordinates using reverse geocoding
    const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
      // Fallback to coordinates if no location permission
      if (!hasLocationPermission) {
        return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }

      try {
        const result = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (result && result.length > 0) {
          const location = result[0];
          if (location.name) {
            return location.name;
          } else if (location.street) {
            return location.street;
          } else if (location.district) {
            return location.district;
          } else if (location.city) {
            return location.city;
          }
        }
        return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      } catch (error) {
        console.error('Error getting location name:', error);
        return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }
    };

    try {
      setLoading(true);

      // Get all photos from media library
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 100, // Load first 100 photos
        sortBy: [[MediaLibrary.SortBy.creationTime, false]], // Newest first
      });

      // Filter photos with GPS data and transform to our Photo type
      const photosWithLocation: Photo[] = [];

      for (const asset of assets) {
        // Get asset info with location data
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);

        // Check if photo has GPS coordinates
        if (assetInfo.location) {
          const { latitude, longitude } = assetInfo.location;

          if (latitude && longitude) {
            // Get readable location name
            const locationName = await getLocationName(latitude, longitude);

            photosWithLocation.push({
              id: asset.id,
              uri: asset.uri,
              latitude,
              longitude,
              timestamp: asset.creationTime,
              locationName,
            });
          }
        }
      }

      setPhotos(photosWithLocation);
    } catch (error) {
      console.error('Error loading photos:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [hasLocationPermission]);
```

**What it does:**

- **Line 14-28**: Checks if app has permission to access photos
- **Line 31-61**: **Reverse geocoding** - converts GPS (46.960562, 7.513203) → "Bern, Switzerland"
- **Line 67-71**: Fetches first 100 photos from device gallery
- **Line 76-91**: **Filters only photos with GPS**, converts to app's Photo type
- This is why only geo-tagged photos appear in the app!

---

### **5. `app/camera.tsx` - Camera Screen**

The **camera implementation** with GPS tagging:

```geo-snap/app/camera.tsx#L122-L175
const takePicture = async () => {
    if (!cameraRef.current || isTakingPhoto) return;

    try {
      setIsTakingPhoto(true);

      // Check permissions before taking photo
      if (!cameraPermission?.granted) {
        Alert.alert(
          "Permission Required",
          "Camera permission is required to take photos."
        );
        return;
      }

      if (!mediaPermission?.granted) {
        const { status } = await requestMediaPermission();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Media library permission is required to save photos."
          );
          return;
        }
      }

      // Take photo and get location
      const [photo, location] = await Promise.all([
        cameraRef.current.takePictureAsync({
          quality: 0.85, // Less quality for better speed
          exif: true,
          skipProcessing: false, // Process for better performance
        }),
        locationPermission?.granted
          ? Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced, // Balanced is faster than High
            }).catch(() => null)
          : Promise.resolve(null),
      ]);

      if (!photo || !photo.uri) {
        throw new Error("Photo URI is missing");
      }

      // Save to gallery with GPS EXIF using native module
      if (location) {
        try {
          const { latitude, longitude } = location.coords;
          const altitude = location.coords.altitude || 0;

          // Use native module to save with GPS EXIF preserved
          const result = await savePhotoWithGPS(photo.uri, {
            latitude,
            longitude,
            altitude,
          });

          if (!result.success) {
            throw new Error(result.error || "Failed to save with GPS");
          }
        } catch {
          // Fallback to standard MediaLibrary (will lose GPS on Android)
          await MediaLibrary.createAssetAsync(photo.uri);

          Alert.alert(
            "Note",
            "Photo saved, but GPS location may not be preserved due to a technical limitation."
          );
        }
      } else {
        await MediaLibrary.createAssetAsync(photo.uri);
      }

      // Platform-specific success message
      const successMessage = location
        ? Platform.OS === "android"
          ? `Photo saved with GPS location! 📍\n\nOpen in Google Photos to see the location on the map.`
          : `Photo saved with location! 📍\n\nSwipe up in Photos app to view on map.`
        : "Photo saved!\n\nEnable location permissions to tag photos with GPS coordinates.";

      Alert.alert("Success", successMessage);
```

**What it does:**

- **Line 128-138**: Takes photo AND gets GPS location **simultaneously** (faster!)
- **Line 145-155**: **Uses custom native module** to save photo with GPS
- **Line 157-164**: Fallback if native module fails
- **Why the native module?** Android's standard `MediaLibrary` **STRIPS GPS EXIF**!

---

### **6. `modules/exif-media-library/` - CUSTOM NATIVE MODULE** 🔥

This is the **most critical part** - a native Android/iOS module that preserves GPS:

#### **TypeScript Interface** (`index.ts`):

```geo-snap/modules/exif-media-library/index.ts#L28-L48
export async function savePhotoWithGPS(
  photoUri: string,
  gpsData: GPSCoordinates
): Promise<SavePhotoResult> {
  return await ExifMediaLibraryModule.savePhotoWithGPS(photoUri, gpsData);
}
```

#### **Android Implementation** (Kotlin):

```geo-snap/modules/exif-media-library/android/src/main/java/expo/modules/exifmedialibrary/ExifMediaLibraryModule.kt#L24-L50
AsyncFunction("savePhotoWithGPS") { photoUri: String, gpsData: Map<String, Any> ->
      try {
        val context = appContext.reactContext ?: throw Exception("Context not available")

        // Extract GPS data from the map
        val latitude = (gpsData["latitude"] as? Number)?.toDouble()
          ?: throw Exception("Missing latitude")
        val longitude = (gpsData["longitude"] as? Number)?.toDouble()
          ?: throw Exception("Missing longitude")
        val altitude = (gpsData["altitude"] as? Number)?.toDouble() ?: 0.0

        // Parse the photo URI
        val sourceFile = getFileFromUri(photoUri)
        if (!sourceFile.exists()) {
          throw Exception("Source file does not exist: $photoUri")
        }

        // Create a temporary file with GPS EXIF embedded
        val tempFile = createTempFileWithGPS(sourceFile, latitude, longitude, altitude)

        // Save to MediaStore with the GPS-embedded file
        val savedUri = saveToMediaStore(context, tempFile)

        // Clean up temp file
        tempFile.delete()
```

**What it does:**

1. **Line 39-40**: Receives photo file and GPS coordinates
2. **Line 44**: Creates temporary copy with GPS EXIF embedded
3. **Line 47**: Saves to Android MediaStore
4. **Line 50**: Cleans up temp file

#### **EXIF Writing** (The Magic):

```geo-snap/modules/exif-media-library/android/src/main/java/expo/modules/exifmedialibrary/ExifMediaLibraryModule.kt#L124-L146
private fun createTempFileWithGPS(
    sourceFile: File,
    latitude: Double,
    longitude: Double,
    altitude: Double
  ): File {
    // Create temp file
    val context = appContext.reactContext ?: throw Exception("Context not available")
    val tempFile = File(context.cacheDir, "gps_temp_${System.currentTimeMillis()}.jpg")

    // Copy source to temp
    FileInputStream(sourceFile).use { input ->
      FileOutputStream(tempFile).use { output ->
        input.copyTo(output)
      }
    }

    // Write GPS EXIF data using ExifInterface
    val exif = ExifInterface(tempFile.absolutePath)

    // Create Location object for ExifInterface
    val location = Location("camera").apply {
      setLatitude(latitude)
      setLongitude(longitude)
      setAltitude(altitude)
      time = System.currentTimeMillis()
    }

    // Set GPS coordinates using Location object
    exif.setGpsInfo(location)

    // Additional GPS metadata for better compatibility
    exif.setAttribute(ExifInterface.TAG_GPS_PROCESSING_METHOD, "HYBRID-FIX")
    exif.setAttribute(ExifInterface.TAG_GPS_MAP_DATUM, "WGS-84")

    // Save the EXIF data
    exif.saveAttributes()

    return tempFile
  }
```

**What it does:**

- **Line 132-137**: Copies photo to temporary file
- **Line 140**: Opens EXIF interface
- **Line 143-148**: Creates Android Location object
- **Line 151**: **Writes GPS to EXIF** using `setGpsInfo()`
- **Line 154-155**: Adds metadata for GPS compatibility
- **Line 158**: Saves EXIF back to file

---

### **7. `lib/photo-grouping.ts` - Smart Clustering**

Groups nearby photos on the map:

```geo-snap/lib/photo-grouping.ts#L19-L32
function getClusterRadius(latitudeDelta: number | undefined): number {
  if (!latitudeDelta) return 5; // Default 5km

  if (latitudeDelta > 50) return 300;   // Very zoomed out - cluster within 300km
  if (latitudeDelta > 20) return 150;   // Zoomed out - cluster within 150km
  if (latitudeDelta > 10) return 75;    // Medium zoom - cluster within 75km
  if (latitudeDelta > 5) return 40;     // Medium-close - cluster within 40km
  if (latitudeDelta > 2) return 15;     // Getting close - cluster within 15km
  if (latitudeDelta > 1) return 8;      // Close - cluster within 8km
  if (latitudeDelta > 0.5) return 3;    // Very close - cluster within 3km
  if (latitudeDelta > 0.2) return 1;    // Very zoomed in - cluster within 1km
  if (latitudeDelta > 0.05) return 0.3; // Extremely zoomed in - cluster within 300m
  return 0.1; // Maximum zoom - cluster within 100m
}
```

**What it does:**

- **Dynamically adjusts clustering** based on zoom level
- When zoomed out → groups photos within 300km
- When zoomed in → shows individual photos

```geo-snap/lib/photo-grouping.ts#L10-L17
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a),
```
