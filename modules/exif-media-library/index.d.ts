/**
 * Type declarations for exif-media-library
 * Native module for saving photos with GPS EXIF data preserved
 */

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
 * Saves a photo to the device's media library with GPS EXIF data preserved.
 *
 * On Android, this uses native ExifInterface to write GPS coordinates
 * directly to the image file before adding it to MediaStore.
 *
 * On iOS, this uses PHPhotoLibrary which already preserves EXIF.
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
 * console.log('Success:', result.success);
 * ```
 */
export function savePhotoWithGPS(
  photoUri: string,
  gpsData: GPSCoordinates
): Promise<SavePhotoResult>;

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
export function hasGPSExif(photoUri: string): Promise<boolean>;

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
export function readGPSExif(photoUri: string): Promise<GPSCoordinates | null>;

declare const _default: {
  savePhotoWithGPS: typeof savePhotoWithGPS;
  hasGPSExif: typeof hasGPSExif;
  readGPSExif: typeof readGPSExif;
};

export default _default;
