import { Photo } from "@/types/photo";
import {
  groupPhotosByLocation,
  groupPhotosByLocationName,
  MapRegion,
} from "../photo-grouping";

describe("photo-grouping", () => {
  describe("groupPhotosByLocation", () => {
    // Positive test case: Successfully groups nearby photos
    it("should group photos that are close together (positive case)", () => {
      const photos: Photo[] = [
        {
          id: "1",
          uri: "photo1.jpg",
          latitude: 48.2082,
          longitude: 16.3738,
          locationName: "Vienna",
          timestamp: 1700000000000,
        },
        {
          id: "2",
          uri: "photo2.jpg",
          latitude: 48.2085,
          longitude: 16.374,
          locationName: "Vienna",
          timestamp: 1700000001000,
        },
        {
          id: "3",
          uri: "photo3.jpg",
          latitude: 47.0707,
          longitude: 15.4395,
          locationName: "Graz",
          timestamp: 1700000002000,
        },
      ];

      const region: MapRegion = {
        latitude: 48.2082,
        longitude: 16.3738,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };

      const result = groupPhotosByLocation(photos, region);

      // Positive outcome: Two groups should be created
      expect(result).toHaveLength(2);

      // First group should have 2 photos (Vienna photos are close)
      expect(result[0].photos).toHaveLength(2);
      expect(result[0].locationName).toBe("Vienna");

      // Second group should have 1 photo (Graz is far away)
      expect(result[1].photos).toHaveLength(1);
      expect(result[1].locationName).toBe("Graz");
    });

    // Negative test case: Empty photo array returns empty groups
    it("should return empty array for empty input (negative case)", () => {
      const photos: Photo[] = [];

      const result = groupPhotosByLocation(photos);

      // Negative outcome: No groups should be created (INTENTIONALLY FAILING)
      expect(result).toHaveLength(1); // This should fail - expecting 1 but gets 0
      expect(result).toEqual([]);
    });

    // Additional negative test case: Null/undefined handling
    it("should handle null photos gracefully (negative case)", () => {
      // @ts-expect-error Testing null input
      const result = groupPhotosByLocation(null);

      // Negative outcome: Should return empty array
      expect(result).toHaveLength(0);
    });
  });

  describe("groupPhotosByLocationName", () => {
    // Positive test case: Successfully groups photos by exact location name
    it("should group photos by location name (positive case)", () => {
      const photos: Photo[] = [
        {
          id: "1",
          uri: "photo1.jpg",
          latitude: 48.2082,
          longitude: 16.3738,
          locationName: "Vienna Center",
          timestamp: 1700000003000,
        },
        {
          id: "2",
          uri: "photo2.jpg",
          latitude: 48.21,
          longitude: 16.375,
          locationName: "Vienna Center",
          timestamp: 1700000002000,
        },
        {
          id: "3",
          uri: "photo3.jpg",
          latitude: 48.22,
          longitude: 16.4,
          locationName: "Vienna Suburbs",
          timestamp: 1700000001000,
        },
      ];

      const result = groupPhotosByLocationName(photos);

      // Positive outcome: Two groups with correct names and sorting
      expect(result).toHaveLength(2);

      // Groups should be sorted by newest photo (id '1' has newest timestamp)
      expect(result[0].locationName).toBe("Vienna Center");
      expect(result[0].photos).toHaveLength(2);

      expect(result[1].locationName).toBe("Vienna Suburbs");
      expect(result[1].photos).toHaveLength(1);
    });

    // Negative test case: Empty array handling
    it("should return empty array when no photos provided (negative case)", () => {
      const photos: Photo[] = [];

      const result = groupPhotosByLocationName(photos);

      // Negative outcome: No groups created
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    // Additional negative test case: Photos without location names get coordinates
    it("should use coordinates for photos without location names (edge case)", () => {
      const photos: Photo[] = [
        {
          id: "1",
          uri: "photo1.jpg",
          latitude: 48.2082,
          longitude: 16.3738,
          locationName: "",
          timestamp: 1700000000000,
        },
      ];

      const result = groupPhotosByLocationName(photos);

      // Edge case handling: Should create group with coordinate-based name
      expect(result).toHaveLength(1);
      expect(result[0].locationName).toBe("48.2082, 16.3738");
    });
  });
});
