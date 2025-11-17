/**
 * GeoCoordinateDisplay Component
 *
 * A simple component to display GPS coordinates
 * Perfect for snapshot testing
 */

import React from 'react';

export interface GeoCoordinateDisplayProps {
  latitude: number;
  longitude: number;
  label?: string;
  showDMS?: boolean; // Show Degrees Minutes Seconds format
}

export function GeoCoordinateDisplay({
  latitude,
  longitude,
  label = 'Coordinates',
  showDMS = false,
}: GeoCoordinateDisplayProps) {
  const formatDecimal = (value: number): string => {
    return value.toFixed(6);
  };

  const toDMS = (decimal: number, isLatitude: boolean): string => {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesFloat = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = ((minutesFloat - minutes) * 60).toFixed(2);

    const direction = isLatitude
      ? (decimal >= 0 ? 'N' : 'S')
      : (decimal >= 0 ? 'E' : 'W');

    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
  };

  return (
    <div className="geo-coordinate-display" data-testid="geo-coordinate-display">
      <div className="label" data-testid="coordinate-label">
        {label}
      </div>

      <div className="coordinates" data-testid="coordinates-container">
        <div className="coordinate-row" data-testid="latitude-row">
          <span className="coordinate-label">Latitude:</span>
          <span className="coordinate-value" data-testid="latitude-value">
            {showDMS ? toDMS(latitude, true) : `${formatDecimal(latitude)}°`}
          </span>
        </div>

        <div className="coordinate-row" data-testid="longitude-row">
          <span className="coordinate-label">Longitude:</span>
          <span className="coordinate-value" data-testid="longitude-value">
            {showDMS ? toDMS(longitude, false) : `${formatDecimal(longitude)}°`}
          </span>
        </div>
      </div>
    </div>
  );
}
