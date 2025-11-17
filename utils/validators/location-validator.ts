/**
 * Location Validator Utility
 *
 * Provides validation functions for GPS coordinates and location data
 * without external dependencies.
 */

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates if a latitude value is within valid range (-90 to 90)
 */
export function isValidLatitude(latitude: number): boolean {
  return typeof latitude === 'number' &&
         !isNaN(latitude) &&
         latitude >= -90 &&
         latitude <= 90;
}

/**
 * Validates if a longitude value is within valid range (-180 to 180)
 */
export function isValidLongitude(longitude: number): boolean {
  return typeof longitude === 'number' &&
         !isNaN(longitude) &&
         longitude >= -180 &&
         longitude <= 180;
}

/**
 * Validates if an altitude value is valid
 */
export function isValidAltitude(altitude: number | null | undefined): boolean {
  if (altitude === null || altitude === undefined) {
    return true; // Altitude is optional
  }
  return typeof altitude === 'number' && !isNaN(altitude);
}

/**
 * Validates a complete LocationData object
 */
export function validateLocation(location: LocationData): ValidationResult {
  const errors: string[] = [];

  if (!location) {
    return {
      valid: false,
      errors: ['Location data is required'],
    };
  }

  if (!isValidLatitude(location.latitude)) {
    errors.push('Latitude must be between -90 and 90 degrees');
  }

  if (!isValidLongitude(location.longitude)) {
    errors.push('Longitude must be between -180 and 180 degrees');
  }

  if (!isValidAltitude(location.altitude)) {
    errors.push('Altitude must be a valid number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates the distance between two points using the Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Formats coordinates as a human-readable string
 */
export function formatCoordinates(location: LocationData): string {
  const lat = location.latitude.toFixed(6);
  const lon = location.longitude.toFixed(6);
  const latDir = location.latitude >= 0 ? 'N' : 'S';
  const lonDir = location.longitude >= 0 ? 'E' : 'W';

  return `${Math.abs(parseFloat(lat))}° ${latDir}, ${Math.abs(parseFloat(lon))}° ${lonDir}`;
}
