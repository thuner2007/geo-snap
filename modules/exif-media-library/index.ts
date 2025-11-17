import { requireNativeModule } from 'expo-modules-core';

/**
 * GPS coordinates interface
 */
export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
}

/**
 * Result of saving a photo with GPS EXIF
 */
export interface SavePhotoResult {
  uri: string;
  assetId: string;
  success: boolean;
  error?: string;
}

/**
 * Native EXIF Media Library Module
 *
 * This module provides Android-native functionality to save photos
 * to the media library while preserving GPS EXIF metadata.
 */
const ExifMediaLibraryModule = requireNativeModule('ExifMediaLibrary');

/**
 * Saves a photo to the device's media library with GPS EXIF data preserved.
 *
 * On Android, this uses native ExifInterface to write GPS coordinates
 * directly to the image file before adding it to MediaStore.
 *
 * On iOS, this falls back to standard MediaLibrary which already preserves EXIF.
 *
 * @param photoUri - URI of the photo file to save
 * @param gpsData - GPS coordinates to embed in EXIF
 * @returns Promise with the saved photo URI and asset ID
 *
 * @example
 * ```typescript
 * const result = await savePhotoWithGPS(
 *   'file:///path/to/photo.jpg',
 *   { latitude: 46.960562, longitude: 7.513203, altitude: 607.5 }
 * );
 * console.log('Photo saved:', result.uri);
 * ```
 */
export async function savePhotoWithGPS(
  photoUri: string,
  gpsData: GPSCoordinates
): Promise<SavePhotoResult> {
  return await ExifMediaLibraryModule.savePhotoWithGPS(photoUri, gpsData);
}

/**
 * Verifies if GPS EXIF data exists in a photo file.
 *
 * @param photoUri - URI of the photo file to check
 * @returns Promise with boolean indicating if GPS EXIF exists
 *
 * @example
 * ```typescript
 * const hasGPS = await hasGPSExif('file:///path/to/photo.jpg');
 * console.log('Has GPS:', hasGPS);
 * ```
 */
export async function hasGPSExif(photoUri: string): Promise<boolean> {
  return await ExifMediaLibraryModule.hasGPSExif(photoUri);
}

/**
 * Reads GPS EXIF data from a photo file.
 *
 * @param photoUri - URI of the photo file to read
 * @returns Promise with GPS coordinates or null if not found
 *
 * @example
 * ```typescript
 * const gps = await readGPSExif('file:///path/to/photo.jpg');
 * if (gps) {
 *   console.log('Location:', gps.latitude, gps.longitude);
 * }
 * ```
 */
export async function readGPSExif(photoUri: string): Promise<GPSCoordinates | null> {
  return await ExifMediaLibraryModule.readGPSExif(photoUri);
}

export default {
  savePhotoWithGPS,
  hasGPSExif,
  readGPSExif,
};
