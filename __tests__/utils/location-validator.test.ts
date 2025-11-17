/**
 * Unit Tests for Location Validator Utility
 *
 * Contains exactly 2 unit tests:
 * - 1 Positive test (valid data)
 * - 1 Negative test (invalid data)
 */

import {
  validateLocation,
  LocationData,
} from '../../utils/validators/location-validator';

describe('Location Validator Utility', () => {
  // POSITIVE TEST
  it('should validate a location with valid coordinates', () => {
    // Arrange
    const location: LocationData = {
      latitude: 48.8566,
      longitude: 2.3522,
      altitude: 35,
    };

    // Act
    const result = validateLocation(location);

    // Assert
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // NEGATIVE TEST
  it('should reject a location with invalid coordinates', () => {
    // Arrange
    const location: LocationData = {
      latitude: 95, // Invalid: exceeds 90
      longitude: 200, // Invalid: exceeds 180
      altitude: NaN, // Invalid: not a number
    };

    // Act
    const result = validateLocation(location);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors).toContain('Latitude must be between -90 and 90 degrees');
    expect(result.errors).toContain('Longitude must be between -180 and 180 degrees');
    expect(result.errors).toContain('Altitude must be a valid number');
  });
});
