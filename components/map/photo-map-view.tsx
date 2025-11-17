import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { PhotoMarker } from "./photo-marker";
import { Photo } from "@/types/photo";
import { groupPhotosByLocation, PhotoGroup } from "@/lib/photo-grouping";

interface PhotoMapViewProps {
  photos?: Photo[];
  onMarkerPress?: (photo: Photo) => void;
  onGroupPress?: (photos: Photo[], locationName?: string) => void;
  focusedPhoto?: Photo | null;
}

export function PhotoMapView({ photos = [], onMarkerPress, onGroupPress, focusedPhoto }: PhotoMapViewProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [photoGroups, setPhotoGroups] = useState<PhotoGroup[]>([]);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const mapRef = useRef<MapView>(null);
  const hasInitiallyFit = useRef(false);
  const lastClusterRegion = useRef<Region | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === "granted");

      if (status === "granted") {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);
      }
    })();
  }, []);

  // Initial region - user's location or default
  const initialRegion = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }
    : {
        latitude: 51.1657,
        longitude: 10.4515,
        latitudeDelta: 8,
        longitudeDelta: 8,
      };

  // Group photos by location with dynamic clustering based on zoom
  useEffect(() => {
    const groups = groupPhotosByLocation(photos, currentRegion);
    setPhotoGroups(groups);
  }, [photos, currentRegion]);

  // Handle region change (zoom/pan)
  const handleRegionChangeComplete = (region: Region) => {
    // Only re-cluster if zoom level changed significantly (more than 20%)
    if (
      !lastClusterRegion.current ||
      Math.abs(region.latitudeDelta - lastClusterRegion.current.latitudeDelta) >
        lastClusterRegion.current.latitudeDelta * 0.2
    ) {
      lastClusterRegion.current = region;
      setCurrentRegion(region);
    }
  };

  // Fit map to show all photo markers ONLY on initial load
  useEffect(() => {
    if (photoGroups.length > 0 && mapRef.current && !hasInitiallyFit.current) {
      const coordinates = photoGroups.map((group) => ({
        latitude: group.latitude,
        longitude: group.longitude,
      }));

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });

      hasInitiallyFit.current = true;
    }
  }, [photoGroups]);

  // Focus on a specific photo when provided
  useEffect(() => {
    if (focusedPhoto && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: focusedPhoto.latitude,
        longitude: focusedPhoto.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [focusedPhoto]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={hasPermission}
        showsMyLocationButton={hasPermission}
        showsCompass={true}
        toolbarEnabled={false}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {photoGroups.map((group, index) => (
          <Marker
            key={`group-${index}`}
            coordinate={{
              latitude: group.latitude,
              longitude: group.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            centerOffset={{ x: 0, y: 0 }}
            onPress={() => {
              if (group.photos.length === 1) {
                onMarkerPress?.(group.photos[0]);
              } else {
                onGroupPress?.(group.photos, group.locationName);
              }
            }}
          >
            <PhotoMarker
              imageUri={group.photos[0].uri}
              size={50}
              count={group.photos.length > 1 ? group.photos.length : undefined}
            />
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
