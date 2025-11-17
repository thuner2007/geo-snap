/**
 * LocationCard Test Component
 *
 * A simple pure React component for snapshot testing
 */

import React from 'react';

export interface LocationCardProps {
  latitude: number;
  longitude: number;
  altitude?: number;
  timestamp?: string;
  title?: string;
}

export function LocationCard({
  latitude,
  longitude,
  altitude,
  timestamp,
  title = 'Location',
}: LocationCardProps) {
  return (
    <div data-testid="location-card" className="location-card">
      <h2 data-testid="title">{title}</h2>
      <div data-testid="coordinates-container" className="coordinates">
        <div data-testid="latitude-row" className="row">
          <span data-testid="latitude-label" className="label">Latitude:</span>
          <span data-testid="latitude-value" className="value">
            {latitude.toFixed(6)}°
          </span>
        </div>
        <div data-testid="longitude-row" className="row">
          <span data-testid="longitude-label" className="label">Longitude:</span>
          <span data-testid="longitude-value" className="value">
            {longitude.toFixed(6)}°
          </span>
        </div>
        {altitude !== undefined && (
          <div data-testid="altitude-row" className="row">
            <span data-testid="altitude-label" className="label">Altitude:</span>
            <span data-testid="altitude-value" className="value">
              {altitude.toFixed(2)}m
            </span>
          </div>
        )}
        {timestamp && (
          <div data-testid="timestamp-row" className="row">
            <span data-testid="timestamp-label" className="label">Time:</span>
            <span data-testid="timestamp-value" className="value">
              {timestamp}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
