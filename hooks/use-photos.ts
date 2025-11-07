import { useState, useEffect } from "react";
import * as MediaLibrary from "expo-media-library";
import * as Location from "expo-location";
import { Photo, PhotosByLocation } from "@/types/photo";

export type { Photo, PhotosByLocation };

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosByLocation, setPhotosByLocation] = useState<PhotosByLocation[]>([]);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestPermissions = async () => {
    try {
      console.log("🔐 Requesting permissions...");

      // Request media library permission
      console.log("📷 Requesting media library permission...");
      const mediaStatus = await MediaLibrary.requestPermissionsAsync();
      console.log("📷 Media permission status:", mediaStatus.status);
      setHasMediaPermission(mediaStatus.status === "granted");

      // Request location permission
      console.log("📍 Requesting location permission...");
      const locationStatus = await Location.requestForegroundPermissionsAsync();
      console.log("📍 Location permission status:", locationStatus.status);
      setHasLocationPermission(locationStatus.status === "granted");

      const result = {
        media: mediaStatus.status === "granted",
        location: locationStatus.status === "granted",
      };

      console.log("✅ Permissions result:", result);
      return result;
    } catch (err) {
      console.error("❌ Permission error:", err);
      setError("Fehler beim Anfordern der Berechtigungen");
      return { media: false, location: false };
    }
  };

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("📸 Loading photos from media library...");

      // Get photos from media library
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        sortBy: ["creationTime"],
        first: 1000,
      });

      console.log(`📸 Found ${media.assets.length} total photos`);

      const photosWithLocation: Photo[] = [];

      // Get location data for each photo
      for (const asset of media.assets) {
        try {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);

          if (assetInfo.location) {
            photosWithLocation.push({
              id: asset.id,
              uri: asset.uri,
              latitude: assetInfo.location.latitude,
              longitude: assetInfo.location.longitude,
              timestamp: asset.creationTime || Date.now(),
            });
          }
        } catch {
          console.log("⚠️ Could not get location for photo:", asset.id);
        }
      }

      console.log(`📍 Found ${photosWithLocation.length} photos with location data`);
      setPhotos(photosWithLocation);
      await groupPhotosByLocation(photosWithLocation);
    } catch (err) {
      console.error("❌ Error loading photos:", err);
      setError("Fotos konnten nicht geladen werden");
    } finally {
      setIsLoading(false);
    }
  };

  const groupPhotosByLocation = async (photoList: Photo[]) => {
    console.log(`🗺️ Grouping ${photoList.length} photos by location...`);

    // Group photos by approximate location (within ~100m)
    const LOCATION_THRESHOLD = 0.001; // ~111m
    const groups: PhotosByLocation[] = [];

    for (const photo of photoList) {
      let foundGroup = false;

      for (const group of groups) {
        const latDiff = Math.abs(group.latitude - photo.latitude);
        const lonDiff = Math.abs(group.longitude - photo.longitude);

        if (latDiff < LOCATION_THRESHOLD && lonDiff < LOCATION_THRESHOLD) {
          group.photos.push(photo);
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        // Get location name
        let locationName = "Unbekannter Ort";
        try {
          const results = await Location.reverseGeocodeAsync({
            latitude: photo.latitude,
            longitude: photo.longitude,
          });

          if (results.length > 0) {
            const result = results[0];
            locationName =
              result.city ||
              result.district ||
              result.subregion ||
              result.region ||
              "Unbekannter Ort";
            console.log(`📍 Found location: ${locationName}`);
          }
        } catch {
          console.log("⚠️ Could not geocode location");
        }

        groups.push({
          location: locationName,
          photos: [photo],
          latitude: photo.latitude,
          longitude: photo.longitude,
        });
      }
    }

    // Sort by number of photos (descending)
    groups.sort((a, b) => b.photos.length - a.photos.length);
    console.log(`✅ Created ${groups.length} location groups`);
    setPhotosByLocation(groups);
  };

  const refresh = async () => {
    console.log("🔄 Refreshing photos...");
    const permissions = await requestPermissions();
    if (permissions.media && permissions.location) {
      await loadPhotos();
    } else {
      console.log("⚠️ Missing permissions for refresh");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    (async () => {
      console.log("🚀 usePhotos hook initialized");
      const permissions = await requestPermissions();

      if (isMounted && permissions.media && permissions.location) {
        console.log("✅ All permissions granted, loading photos...");
        await loadPhotos();
      } else if (isMounted) {
        console.log("⚠️ Permissions not granted:", permissions);
        setIsLoading(false);
      }
    })();

    return () => {
      console.log("🛑 usePhotos hook unmounting");
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    photos,
    photosByLocation,
    hasMediaPermission,
    hasLocationPermission,
    isLoading,
    error,
    refresh,
    requestPermissions,
  };
}
