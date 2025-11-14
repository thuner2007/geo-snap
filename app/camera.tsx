import { ThemedView } from "@/components/themed-view";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { savePhotoWithGPS } from "exif-media-library";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

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
    } catch {
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

      // Take photo and get location
      const [photo, location] = await Promise.all([
        cameraRef.current.takePictureAsync({
          quality: 0.85, // Less quality for better speed
          exif: true,
          skipProcessing: false, // Process for better performance
        }),
        locationPermission?.granted
          ? Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            }).catch(() => null)
          : Promise.resolve(null),
      ]);

      if (!photo || !photo.uri) {
        throw new Error("Photo URI is missing");
      }

      // Save to gallery with GPS EXIF if location is available
      if (location) {
        try {
          const { latitude, longitude } = location.coords;
          const altitude = location.coords.altitude || 0;

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

      const successMessage = location
        ? Platform.OS === "android"
          ? `Photo saved with GPS location!\n\nOpen in Photos app to see the location on the map.`
          : `Photo saved with location!\n\nSwipe up in Photos app to view on map.`
        : "Photo saved!\n\nEnable location permissions to tag photos with GPS coordinates.";

      Alert.alert("Success", successMessage);
    } catch (error: any) {
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

  // Check if permissions are still loading
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
