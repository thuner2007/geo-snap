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

      // Take photo and get location in PARALLEL for speed
      const [photo, location] = await Promise.all([
        cameraRef.current.takePictureAsync({
          quality: 0.85, // Good balance between quality and speed
          exif: true,
          skipProcessing: false, // Process for better performance
        }),
        locationPermission?.granted
          ? Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced, // Balanced is faster than High
            }).catch((error) => {
              console.error("Error getting location:", error);
              return null;
            })
          : Promise.resolve(null),
      ]);

      console.log("Photo taken:", photo);

      if (!photo || !photo.uri) {
        throw new Error("Photo URI is missing");
      }

      // Show immediate feedback - photo captured successfully
      console.log("Photo captured, processing...");

      let finalUri = photo.uri;

      // If we have location, embed GPS EXIF data properly
      if (location) {
        try {
          console.log("Embedding GPS EXIF data...");
          console.log(`Platform: ${Platform.OS}`);

          const { latitude, longitude } = location.coords;
          const altitude = location.coords.altitude || 0;

          console.log(
            `GPS Data - Lat: ${latitude}, Lng: ${longitude}, Alt: ${altitude}`
          );

          // Convert decimal degrees to degrees, minutes, seconds (EXIF GPS format)
          const toDegreesMinutesSeconds = (decimal: number) => {
            const absolute = Math.abs(decimal);
            const degrees = Math.floor(absolute);
            const minutesFloat = (absolute - degrees) * 60;
            const minutes = Math.floor(minutesFloat);
            const seconds = (minutesFloat - minutes) * 60;

            return [
              [degrees, 1],
              [minutes, 1],
              [Math.round(seconds * 100), 100],
            ];
          };

          // Read the image file
          const photoFile = new File(photo.uri);
          const arrayBuffer = await photoFile.arrayBuffer();

          // Optimized: Convert ArrayBuffer to base64 using chunks for speed
          const inputBytes = new Uint8Array(arrayBuffer);
          const chunkSize = 32768; // Process in 32KB chunks for better performance
          let binary = "";

          for (let i = 0; i < inputBytes.length; i += chunkSize) {
            const chunk = inputBytes.subarray(
              i,
              Math.min(i + chunkSize, inputBytes.length)
            );
            binary += String.fromCharCode(...chunk);
          }

          const base64 = btoa(binary);

          // Create data URI for piexif
          const imageData = `data:image/jpeg;base64,${base64}`;

          // Load existing EXIF or create new
          let exifObj;
          try {
            exifObj = piexif.load(imageData);
          } catch {
            exifObj = { "0th": {}, Exif: {}, GPS: {}, Interop: {}, "1st": {} };
          }

          // Add GPS data with proper EXIF tags
          exifObj.GPS[piexif.GPSIFD.GPSLatitudeRef] = latitude >= 0 ? "N" : "S";
          exifObj.GPS[piexif.GPSIFD.GPSLatitude] =
            toDegreesMinutesSeconds(latitude);
          exifObj.GPS[piexif.GPSIFD.GPSLongitudeRef] =
            longitude >= 0 ? "E" : "W";
          exifObj.GPS[piexif.GPSIFD.GPSLongitude] =
            toDegreesMinutesSeconds(longitude);
          exifObj.GPS[piexif.GPSIFD.GPSAltitudeRef] = altitude >= 0 ? 0 : 1;
          exifObj.GPS[piexif.GPSIFD.GPSAltitude] = [
            Math.abs(Math.round(altitude * 100)),
            100,
          ];

          // Add GPS timestamp
          const now = new Date();
          exifObj.GPS[piexif.GPSIFD.GPSDateStamp] = now
            .toISOString()
            .split("T")[0]
            .replace(/-/g, ":");
          exifObj.GPS[piexif.GPSIFD.GPSTimeStamp] = [
            [now.getUTCHours(), 1],
            [now.getUTCMinutes(), 1],
            [now.getUTCSeconds(), 1],
          ];

          // Add GPS processing method and version (important for Android)
          exifObj.GPS[piexif.GPSIFD.GPSVersionID] = [2, 2, 0, 0];
          exifObj.GPS[piexif.GPSIFD.GPSMapDatum] = "WGS-84";

          console.log("EXIF GPS object:", JSON.stringify(exifObj.GPS, null, 2));

          // Dump EXIF to binary
          const exifBytes = piexif.dump(exifObj);

          // Insert EXIF into image
          const newImageData = piexif.insert(exifBytes, imageData);

          // Write the new image with GPS EXIF to file system
          const timestamp = Date.now();
          const fileName =
            Platform.OS === "android"
              ? `GPS_PHOTO_${timestamp}.jpg`
              : `photo_${timestamp}.jpg`;
          const newPhotoFile = new File(Paths.cache, fileName);
          const newBase64 = newImageData.replace("data:image/jpeg;base64,", "");

          // Optimized: Convert base64 to Uint8Array using chunks
          const binaryString = atob(newBase64);
          const bytes = new Uint8Array(binaryString.length);

          // Use chunks for faster conversion
          const writeChunkSize = 32768;
          for (let i = 0; i < binaryString.length; i += writeChunkSize) {
            const end = Math.min(i + writeChunkSize, binaryString.length);
            for (let j = i; j < end; j++) {
              bytes[j] = binaryString.charCodeAt(j);
            }
          }

          // Write the file
          await newPhotoFile.write(bytes);

          // Verify file was written (especially important on Android)
          console.log("Verifying file write...");
          const fileExists = newPhotoFile.exists;
          if (!fileExists) {
            throw new Error("Failed to write file with GPS EXIF data");
          }
          console.log("File verified, size:", bytes.length, "bytes");

          finalUri = newPhotoFile.uri;
          console.log("GPS EXIF data embedded successfully");
          console.log("New photo URI:", finalUri);
        } catch (exifError) {
          console.error("Error embedding GPS EXIF:", exifError);
          console.error("EXIF error details:", exifError);
          // Continue with original photo
        }
      } else {
        console.log("No location available - saving photo without GPS data");
      }

      // Save to gallery
      console.log("Saving to gallery...");
      console.log("Final URI to save:", finalUri);

      // On Android, we might need to explicitly save to a specific album
      const asset = await MediaLibrary.createAssetAsync(finalUri);

      console.log("Photo saved to gallery:", asset);
      console.log("Asset URI:", asset.uri);
      console.log("Asset details:", JSON.stringify(asset, null, 2));

      // On Android, trigger media scanner to ensure gallery picks up EXIF
      if (Platform.OS === "android" && location) {
        console.log(
          "Android: Requesting media scanner to pick up EXIF data..."
        );
        // The gallery should automatically scan, but log for debugging
      }

      if (location) {
        console.log(
          `GPS Coordinates: Lat ${location.coords.latitude}, Lng ${location.coords.longitude}`
        );
      }

      // Platform-specific success message
      const successMessage = location
        ? Platform.OS === "android"
          ? `Photo saved with location! 📍\n\nOpen Google Photos to see location on map.`
          : `Photo saved with location! 📍\n\nSwipe up in Photos app to view on map.`
        : "Photo saved!\n\nEnable location in Settings to tag photos.";

      Alert.alert("Success", successMessage);
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
