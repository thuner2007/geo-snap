import { Photo } from "@/types/photo";

export interface PhotoGroup {
  locationName: string;
  photos: Photo[];
  latitude: number;
  longitude: number;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Calculates the distance between two coordinates in kilometers using Haversine formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

 //Calculate clustering radius based on map zoom level (latitudeDelta)
 // Smaller latitudeDelta = more zoomed in = smaller cluster radius
function getClusterRadius(latitudeDelta: number | undefined): number {
  if (!latitudeDelta) return 5; // Default 5km

  if (latitudeDelta > 50) return 300;
  if (latitudeDelta > 20) return 150;
  if (latitudeDelta > 10) return 75;
  if (latitudeDelta > 5) return 40;
  if (latitudeDelta > 2) return 15;
  if (latitudeDelta > 1) return 8;
  if (latitudeDelta > 0.5) return 3;
  if (latitudeDelta > 0.2) return 1;
  if (latitudeDelta > 0.05) return 0.3;
  return 0.1;
}

 // Groups photos by geographic proximity with zoom-based clustering
 // The cluster radius adjusts based on the map zoom level
export function groupPhotosByLocation(photos: Photo[], region?: MapRegion | null): PhotoGroup[] {
  if (!photos || photos.length === 0) {
    return [];
  }

  const CLUSTER_RADIUS_KM = getClusterRadius(region?.latitudeDelta);
  const groups: PhotoGroup[] = [];
  const processed = new Set<string>();

  photos.forEach((photo) => {
    if (processed.has(photo.id)) {
      return;
    }

    const clusterPhotos: Photo[] = [photo];
    processed.add(photo.id);

    const photoLat = photo.latitude;
    const photoLon = photo.longitude;

    photos.forEach((otherPhoto) => {
      if (processed.has(otherPhoto.id)) {
        return;
      }

      const distance = getDistance(photoLat, photoLon, otherPhoto.latitude, otherPhoto.longitude);

      if (distance <= CLUSTER_RADIUS_KM) {
        clusterPhotos.push(otherPhoto);
        processed.add(otherPhoto.id);
      }
    });

    const avgLat = clusterPhotos.reduce((sum, p) => sum + p.latitude, 0) / clusterPhotos.length;
    const avgLon = clusterPhotos.reduce((sum, p) => sum + p.longitude, 0) / clusterPhotos.length;

    const locationName = clusterPhotos[0].locationName ||
      `${avgLat.toFixed(4)}, ${avgLon.toFixed(4)}`;

    groups.push({
      locationName,
      photos: clusterPhotos,
      latitude: avgLat,
      longitude: avgLon,
    });
  });

  return groups;
}

// Groups photos by exact location name (for gallery view)
// This creates groups where all photos have the same location name
export function groupPhotosByLocationName(photos: Photo[]): PhotoGroup[] {
  if (!photos || photos.length === 0) {
    return [];
  }

  const groupMap = new Map<string, Photo[]>();

  // Group photos by location name
  photos.forEach((photo) => {
    const locationKey = photo.locationName || `${photo.latitude.toFixed(4)}, ${photo.longitude.toFixed(4)}`;

    if (!groupMap.has(locationKey)) {
      groupMap.set(locationKey, []);
    }
    groupMap.get(locationKey)!.push(photo);
  });

  // Convert map to PhotoGroup array
  const groups: PhotoGroup[] = [];
  groupMap.forEach((groupPhotos, locationName) => {
    const avgLat = groupPhotos.reduce((sum, p) => sum + p.latitude, 0) / groupPhotos.length;
    const avgLon = groupPhotos.reduce((sum, p) => sum + p.longitude, 0) / groupPhotos.length;

    groups.push({
      locationName,
      photos: groupPhotos,
      latitude: avgLat,
      longitude: avgLon,
    });
  });

  // Sort by most recent photo in each group
  groups.sort((a, b) => {
    const aNewest = Math.max(...a.photos.map(p => p.timestamp));
    const bNewest = Math.max(...b.photos.map(p => p.timestamp));
    return bNewest - aNewest;
  });

  return groups;
}
