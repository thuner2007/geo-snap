export interface Photo {
  id: string;
  uri: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface PhotosByLocation {
  location: string;
  photos: Photo[];
  latitude: number;
  longitude: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface PhotoMetadata {
  id: string;
  uri: string;
  location?: Location;
  timestamp: number;
  width?: number;
  height?: number;
}
