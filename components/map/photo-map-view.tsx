import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { PhotoMarker } from "./photo-marker";
import { Photo } from "@/types/photo";

interface PhotoMapViewProps {
  photos?: Photo[];
  onMarkerPress?: (photo: Photo) => void;
}

export function PhotoMapView({ photos = [], onMarkerPress }: PhotoMapViewProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const mapRef = useRef<MapView>(null);

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
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    : {
        latitude: 51.1657, // London default
        longitude: 10.4515,
        latitudeDelta: 5,
        longitudeDelta: 5,
      };

  // Fit map to show all photo markers when photos exist
  useEffect(() => {
    if (photos.length > 0 && mapRef.current) {
      const coordinates = photos.map((photo) => ({
        latitude: photo.latitude,
        longitude: photo.longitude,
      }));

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [photos]);

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
      >
        {photos.map((photo) => (
          <Marker
            key={photo.id}
            coordinate={{
              latitude: photo.latitude,
              longitude: photo.longitude,
            }}
            onPress={() => onMarkerPress?.(photo)}
            anchor={{ x: 0.5, y: 1 }}
          >
            <PhotoMarker imageUri={photo.uri} size={40} />
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
