/**
 * EXIF Helper Utility for GPS Data Embedding
 *
 * This utility handles embedding GPS location data into JPEG image EXIF metadata.
 * It includes Android-specific optimizations to ensure location data is preserved
 * when saving photos to the media library.
 */

import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const piexif = require("piexifjs");

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number | null;
}

export interface EmbedGPSResult {
  uri: string;
  success: boolean;
  error?: string;
}

/**
 * Converts decimal degrees to degrees, minutes, seconds format required by EXIF GPS tags
 */
function toDegreesMinutesSeconds(decimal: number): [[number, number], [number, number], [number, number]] {
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
}

/**
 * Embeds GPS EXIF data into a JPEG image
 *
 * @param imageUri - URI of the source image
 * @param location - GPS coordinates to embed
 * @param outputPath - Optional custom output path (defaults to temporary directory)
 * @returns Promise with the new image URI and success status
 */
export async function embedGPSExif(
  imageUri: string,
  location: LocationData,
  outputPath?: string
): Promise<EmbedGPSResult> {
  try {
    console.log("[EXIF Helper] Starting GPS EXIF embedding...");
    console.log(`[EXIF Helper] Platform: ${Platform.OS}`);
    console.log(`[EXIF Helper] Location: Lat ${location.latitude}, Lng ${location.longitude}`);

    // Read the image as base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Create data URI for piexif
    const imageData = `data:image/jpeg;base64,${base64Image}`;

    // Load existing EXIF or create new structure
    let exifObj;
    try {
      exifObj = piexif.load(imageData);
      console.log("[EXIF Helper] Loaded existing EXIF data");
    } catch {
      console.log("[EXIF Helper] Creating new EXIF structure");
      exifObj = {
        "0th": {},
        Exif: {},
        GPS: {},
        Interop: {},
        "1st": {}
      };
    }

    // Ensure GPS object exists
    if (!exifObj.GPS) {
      exifObj.GPS = {};
    }

    // Add GPS coordinates
    const { latitude, longitude, altitude = 0 } = location;

    exifObj.GPS[piexif.GPSIFD.GPSLatitudeRef] = latitude >= 0 ? "N" : "S";
    exifObj.GPS[piexif.GPSIFD.GPSLatitude] = toDegreesMinutesSeconds(latitude);

    exifObj.GPS[piexif.GPSIFD.GPSLongitudeRef] = longitude >= 0 ? "E" : "W";
    exifObj.GPS[piexif.GPSIFD.GPSLongitude] = toDegreesMinutesSeconds(longitude);

    const altitudeValue = altitude || 0;
    exifObj.GPS[piexif.GPSIFD.GPSAltitudeRef] = altitudeValue >= 0 ? 0 : 1;
    exifObj.GPS[piexif.GPSIFD.GPSAltitude] = [
      Math.abs(Math.round(altitudeValue * 100)),
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

    // Add GPS version and datum (important for compatibility)
    exifObj.GPS[piexif.GPSIFD.GPSVersionID] = [2, 2, 0, 0];
    exifObj.GPS[piexif.GPSIFD.GPSMapDatum] = "WGS-84";

    // Add processing method for Android compatibility
    if (Platform.OS === "android") {
      exifObj.GPS[piexif.GPSIFD.GPSProcessingMethod] = "HYBRID-FIX";
    }

    console.log("[EXIF Helper] GPS EXIF tags prepared:", Object.keys(exifObj.GPS));

    // Dump EXIF to binary
    const exifBytes = piexif.dump(exifObj);

    // Insert EXIF into image
    const newImageData = piexif.insert(exifBytes, imageData);

    // Determine output path
    const timestamp = Date.now();
    const fileName = Platform.OS === "android"
      ? `GPS_PHOTO_${timestamp}.jpg`
      : `photo_${timestamp}.jpg`;

    const finalOutputPath = outputPath || `${FileSystem.documentDirectory}${fileName}`;

    // Write the new image with EXIF data
    const newBase64 = newImageData.replace("data:image/jpeg;base64,", "");
    await FileSystem.writeAsStringAsync(finalOutputPath, newBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Verify the file was written
    const fileInfo = await FileSystem.getInfoAsync(finalOutputPath);

    if (!fileInfo.exists) {
      throw new Error("Failed to write EXIF-embedded image file");
    }

    console.log("[EXIF Helper] GPS EXIF embedded successfully");
    console.log(`[EXIF Helper] Output file: ${finalOutputPath}`);
    console.log(`[EXIF Helper] File size: ${fileInfo.size} bytes`);

    return {
      uri: finalOutputPath,
      success: true,
    };
  } catch (error: any) {
    console.error("[EXIF Helper] Error embedding GPS EXIF:", error);

    return {
      uri: imageUri, // Return original URI on failure
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Verifies if an image file contains GPS EXIF data
 *
 * @param imageUri - URI of the image to check
 * @returns Promise with verification result and GPS data if found
 */
export async function verifyGPSExif(imageUri: string): Promise<{
  hasGPS: boolean;
  location?: LocationData;
  error?: string;
}> {
  try {
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const imageData = `data:image/jpeg;base64,${base64Image}`;
    const exifObj = piexif.load(imageData);

    if (!exifObj.GPS || Object.keys(exifObj.GPS).length === 0) {
      return { hasGPS: false };
    }

    // Try to extract GPS coordinates if present
    const latRef = exifObj.GPS[piexif.GPSIFD.GPSLatitudeRef];
    const latDMS = exifObj.GPS[piexif.GPSIFD.GPSLatitude];
    const lonRef = exifObj.GPS[piexif.GPSIFD.GPSLongitudeRef];
    const lonDMS = exifObj.GPS[piexif.GPSIFD.GPSLongitude];

    if (latDMS && lonDMS) {
      // Convert DMS back to decimal (simplified)
      const lat = latDMS[0][0] + latDMS[1][0] / 60 + latDMS[2][0] / latDMS[2][1] / 3600;
      const lon = lonDMS[0][0] + lonDMS[1][0] / 60 + lonDMS[2][0] / lonDMS[2][1] / 3600;

      return {
        hasGPS: true,
        location: {
          latitude: latRef === "S" ? -lat : lat,
          longitude: lonRef === "W" ? -lon : lon,
        },
      };
    }

    return { hasGPS: true }; // Has GPS tags but couldn't parse
  } catch (error: any) {
    return {
      hasGPS: false,
      error: error.message || "Failed to verify EXIF",
    };
  }
}

/**
 * Platform-specific helper to check if EXIF preservation is supported
 */
export function isExifPreservationSupported(): boolean {
  // Both iOS and Android support EXIF, but Android requires special handling
  return true;
}

/**
 * Gets the recommended approach for saving photos with EXIF on current platform
 */
export function getRecommendedSaveApproach(): {
  platform: string;
  approach: string;
  notes: string;
} {
  if (Platform.OS === "android") {
    return {
      platform: "Android",
      approach: "Manual EXIF embedding with piexifjs before MediaLibrary.createAssetAsync",
      notes: "Android's MediaLibrary may strip EXIF data, so we embed it manually first.",
    };
  } else if (Platform.OS === "ios") {
    return {
      platform: "iOS",
      approach: "Standard MediaLibrary.createAssetAsync with EXIF preservation",
      notes: "iOS preserves EXIF data by default when using MediaLibrary.",
    };
  } else {
    return {
      platform: Platform.OS,
      approach: "Standard approach",
      notes: "EXIF handling may vary on this platform.",
    };
  }
}
