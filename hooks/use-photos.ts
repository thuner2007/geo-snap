import { useState, useEffect, useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import { Photo } from '@/types/photo';

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<MediaLibrary.PermissionStatus | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Check existing permissions
  const checkPermission = useCallback(async () => {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      setPermissionStatus(status);
      setHasPermission(status === 'granted');

      // Also check location permission for reverse geocoding
      const locationStatus = await Location.getForegroundPermissionsAsync();
      setHasLocationPermission(locationStatus.granted);

      return status === 'granted';
    } catch (error) {
      console.error('Error checking media library permission:', error);
      return false;
    }
  }, []);

  // Load photos from device media library
  const loadPhotos = useCallback(async () => {
    // Get location name from coordinates using reverse geocoding
    const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
      // Fallback to coordinates if no location permission
      if (!hasLocationPermission) {
        return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }

      try {
        const result = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (result && result.length > 0) {
          const location = result[0];
          if (location.name) {
            return location.name;
          } else if (location.street) {
            return location.street;
          } else if (location.district) {
            return location.district;
          } else if (location.city) {
            return location.city;
          }
        }
        return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      } catch (error) {
        console.error('Error getting location name:', error);
        return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }
    };

    try {
      setLoading(true);

      // Get all photos from media library
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 100, // Load first 100 photos
        sortBy: [[MediaLibrary.SortBy.creationTime, false]], // Newest first
      });

      // Filter photos with GPS data and transform to our Photo type
      const photosWithLocation: Photo[] = [];

      for (const asset of assets) {
        // Get asset info with location data
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);

        // Check if photo has GPS coordinates
        if (assetInfo.location) {
          const { latitude, longitude } = assetInfo.location;

          if (latitude && longitude) {
            // Get readable location name
            const locationName = await getLocationName(latitude, longitude);

            photosWithLocation.push({
              id: asset.id,
              uri: asset.uri,
              latitude,
              longitude,
              timestamp: asset.creationTime,
              locationName,
            });
          }
        }
      }

      setPhotos(photosWithLocation);
    } catch (error) {
      console.error('Error loading photos:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [hasLocationPermission]);

  // Request gallery permissions
  const requestPermission = useCallback(async () => {
    try {
      // Request media library permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setPermissionStatus(status);
      setHasPermission(status === 'granted');

      // Also request location permission for reverse geocoding (optional)
      if (status === 'granted') {
        const locationStatus = await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(locationStatus.granted);

        await loadPhotos();
      }

      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      return false;
    }
  }, [loadPhotos]);

  // Refresh photos
  const refresh = useCallback(async () => {
    if (hasPermission) {
      await loadPhotos();
    }
  }, [hasPermission, loadPhotos]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      const permitted = await checkPermission();
      if (permitted) {
        await loadPhotos();
      } else {
        setLoading(false);
      }
    };
    init();
  }, [checkPermission, loadPhotos]);

  return {
    photos,
    loading,
    hasPermission,
    permissionStatus,
    requestPermission,
    checkPermission,
    refresh,
    photoCount: photos.length,
  };
}
