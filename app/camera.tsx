import { ThemedView } from "@/components/themed-view";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const piexif = require("piexifjs");

export default function CameraScreen() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>("back");
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] =
    MediaLibrary.usePermissions();
  const [locationPermission, requestLocationPermission] =
    Location.useForegroundPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [currentZoom, setCurrentZoom] = useState(0);
  const baseZoom = useRef(0);

  // Automatically request permissions when component mounts
  useEffect(() => {
    const requestPermissions = async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }
      if (!mediaPermission?.granted) {
        await requestMediaPermission();
      }
      if (!locationPermission?.granted) {
        await requestLocationPermission();
      }
    };

    requestPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pinch gesture handler for zoom with proper clamping
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      baseZoom.current = currentZoom;
    })
    .onUpdate((event) => {
      // Calculate new zoom based on pinch scale
      const scale = event.scale;
      const newZoom = baseZoom.current + (scale - 1) * 0.5;

      // Clamp zoom between 0 (no zoom) and 0.5 (50% zoom)
      const clampedZoom = Math.max(0, Math.min(newZoom, 0.5));
      setCurrentZoom(clampedZoom);
      setZoomLevel(clampedZoom);
    })
    .onEnd(() => {
      baseZoom.current = currentZoom;
    });

  const openGallery = async () => {
    try {
      // Request media library permissions if not granted
      if (!mediaPermission?.granted) {
        const { status } = await requestMediaPermission();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Media library permission is required to access the gallery."
          );
          return;
        }
      }

      // Open image picker to view gallery
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        // You can handle the selected image here if needed
        console.log("Selected image:", result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error opening gallery:", error);
      Alert.alert("Error", "Failed to open gallery.");
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

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

      console.log("Taking picture...");

      // Get current location
      let location = null;
      try {
        if (locationPermission?.granted) {
          console.log("Getting location...");
          location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          console.log("Location obtained:", location.coords);
        } else {
          console.log("Location permission not granted");
        }
      } catch (locationError) {
        console.error("Error getting location:", locationError);
        // Continue without location
      }

      // Take the photo with EXIF data
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        exif: true,
      });

      console.log("Photo taken:", photo);

      if (photo && photo.uri) {
        console.log("Saving to gallery with location...");
        console.log("Photo EXIF data:", photo.exif);

        let finalUri = photo.uri;

        // If we have location, embed GPS data into the image EXIF
        if (location) {
          try {
            console.log("Adding GPS EXIF data to photo...");

            // Convert coordinates to EXIF GPS format
            const latitude = location.coords.latitude;
            const longitude = location.coords.longitude;
            const altitude = location.coords.altitude || 0;

            // Convert decimal degrees to degrees, minutes, seconds
            const toExifGPS = (decimal: number, isLatitude: boolean) => {
              const absolute = Math.abs(decimal);
              const degrees = Math.floor(absolute);
              const minutesDecimal = (absolute - degrees) * 60;
              const minutes = Math.floor(minutesDecimal);
              const seconds = (minutesDecimal - minutes) * 60;

              const ref = isLatitude
                ? decimal >= 0
                  ? "N"
                  : "S"
                : decimal >= 0
                ? "E"
                : "W";

              return {
                value: [
                  [degrees, 1],
                  [Math.floor(minutes), 1],
                  [Math.floor(seconds * 100), 100],
                ],
                ref: ref,
              };
            };

            const latGPS = toExifGPS(latitude, true);
            const lonGPS = toExifGPS(longitude, false);

            // Read the photo as base64
            const photoFile = new File(photo.uri);
            const base64 = await photoFile.text();
            const base64Data = base64.startsWith("data:")
              ? base64.split(",")[1]
              : base64;

            // Convert to JPEG with data URI
            const imageData = `data:image/jpeg;base64,${base64Data}`;

            // Get existing EXIF or create new one
            let exifObj = piexif.load(imageData);

            // Add GPS data
            exifObj.GPS = {
              [piexif.GPSIFD.GPSLatitude]: latGPS.value,
              [piexif.GPSIFD.GPSLatitudeRef]: latGPS.ref,
              [piexif.GPSIFD.GPSLongitude]: lonGPS.value,
              [piexif.GPSIFD.GPSLongitudeRef]: lonGPS.ref,
              [piexif.GPSIFD.GPSAltitude]: [Math.floor(altitude * 100), 100],
              [piexif.GPSIFD.GPSAltitudeRef]: altitude >= 0 ? 0 : 1,
            };

            // Convert EXIF to binary
            const exifBytes = piexif.dump(exifObj);

            // Insert EXIF into image
            const newImageData = piexif.insert(exifBytes, imageData);

            // Save the new image with GPS EXIF data
            const newBase64 = newImageData.split(",")[1];
            const newFile = new File(
              Paths.cache,
              `photo_with_gps_${Date.now()}.jpg`
            );
            await newFile.write(newBase64);

            finalUri = newFile.uri;
            console.log("GPS EXIF data added successfully");
          } catch (exifError) {
            console.error("Error adding GPS EXIF:", exifError);
            // Continue with original photo if EXIF embedding fails
          }
        }

        // Save to gallery - now with GPS EXIF data
        const asset = await MediaLibrary.createAssetAsync(finalUri);

        console.log("Photo saved to gallery:", asset);

        if (location) {
          console.log(
            `GPS Coordinates embedded: Lat ${location.coords.latitude}, Lng ${location.coords.longitude}`
          );
        }

        const successMessage = location
          ? `Photo saved with GPS location!\nLat: ${location.coords.latitude.toFixed(
              6
            )}, Lng: ${location.coords.longitude.toFixed(
              6
            )}\n\nOpen Photos app → tap photo → swipe up to see location on map.`
          : "Photo saved to gallery!\n\nEnable location permission to save GPS data with your photos.";

        Alert.alert("Success", successMessage, [
          { text: "OK", onPress: () => {} },
        ]);
      } else {
        throw new Error("Photo URI is missing");
      }
    } catch (error: any) {
      console.error("Error taking picture:", error);

      let errorMessage = "Failed to take or save photo. Please try again.";

      if (error.message) {
        errorMessage += `\n\nError: ${error.message}`;
      }

      if (error.code) {
        errorMessage += `\nCode: ${error.code}`;
      }

      Alert.alert("Camera Error", errorMessage);
    } finally {
      setIsTakingPhoto(false);
    }
  };

  // Check if permissions are not determined yet
  if (!cameraPermission || !mediaPermission) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </ThemedView>
    );
  }

  // Show loading while waiting for permissions
  if (!cameraPermission.granted || !mediaPermission.granted) {
    return (
      <ThemedView style={styles.container}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.permissionText}>Requesting permissions...</Text>
      </ThemedView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={pinchGesture}>
        <View style={styles.camera}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            zoom={currentZoom}
          >
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>

              {/* Zoom Level Indicator */}
              {zoomLevel > 0 && (
                <View style={styles.zoomIndicator}>
                  <Text style={styles.zoomText}>
                    {(1 + zoomLevel * 2).toFixed(1)}x
                  </Text>
                </View>
              )}

              <View style={styles.bottomControls}>
                <TouchableOpacity
                  style={styles.flipButton}
                  onPress={toggleCameraFacing}
                  activeOpacity={0.8}
                >
                  <FontAwesome6 name="arrows-rotate" size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.captureButton,
                    isTakingPhoto && styles.captureButtonDisabled,
                  ]}
                  onPress={takePicture}
                  activeOpacity={0.8}
                  disabled={isTakingPhoto}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.galleryButton}
                  onPress={openGallery}
                  activeOpacity={0.8}
                >
                  <Feather name="image" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  text: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeIcon: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "300",
  },
  bottomControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  flipButton: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "white",
    borderWidth: 1,
  },
  galleryButton: {
    width: 55,
    height: 55,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "white",
    borderWidth: 1,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#ffffff",
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#ffffff",
  },
  zoomIndicator: {
    position: "absolute",
    top: 70,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  zoomText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
