# Photo Map Component

Diese Komponente zeigt eine interaktive Karte mit allen Foto-Locations als Pins an.

## Features

- ✅ Interaktive Karte mit react-native-maps (iOS & Android)
- ✅ Automatische User-Location mit expo-location
- ✅ Custom Photo Markers mit Thumbnail-Preview
- ✅ Auto-Fit: Karte zoomt automatisch auf alle Foto-Pins
- ✅ Touch-Handler für Marker (zeigt Foto-Details)
- ✅ Web-Fallback: Info-Bildschirm für Browser (Maps nur auf Mobile)

## Platform Support

- **iOS**: ✅ Apple Maps (kein API Key nötig)
- **Android**: ✅ Google Maps (API Key erforderlich)
- **Web**: ⚠️ Fallback-Ansicht (react-native-maps funktioniert nicht im Browser)

Die App ist **mobile-first**. Im Web wird eine Hinweis-Seite angezeigt, dass Maps nur in der mobilen App verfügbar sind.

## Setup

### 1. Google Maps API Key (nur für Android)

Für Android brauchst du einen Google Maps API Key:

1. Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
2. Erstelle ein neues Projekt oder wähle ein bestehendes
3. Aktiviere die "Maps SDK for Android" API
4. Erstelle einen API Key unter "Credentials"
5. Füge den Key in `app.json` ein:

```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "DEIN_ECHTER_API_KEY_HIER"
    }
  }
}
```

**Wichtig:** iOS benötigt keinen API Key - Apple Maps wird automatisch verwendet!

### 2. Permissions

Die Location-Permissions sind bereits in `app.json` konfiguriert:

- **iOS**: `NSLocationWhenInUseUsageDescription`
- **Android**: `ACCESS_FINE_LOCATION` und `ACCESS_COARSE_LOCATION`

## Verwendung

```tsx
import { PhotoMapView } from "@/components/map/photo-map-view";

<PhotoMapView
  photos={[
    {
      id: "1",
      uri: "file://...",
      latitude: 51.5074,
      longitude: -0.1278,
      timestamp: Date.now()
    }
  ]}
  onMarkerPress={(photo) => {
    console.log("Foto angeklickt:", photo.id);
  }}
/>
```

## Komponenten

### PhotoMapView
Haupt-Map-Komponente mit Location-Tracking und Marker-Rendering.

**Props:**
- `photos`: Array von Photo-Objekten
- `onMarkerPress`: Callback wenn ein Marker/Pin angeklickt wird

### PhotoMarker
Custom Marker-Komponente die ein Foto-Thumbnail als Pin anzeigt.

**Props:**
- `imageUri`: URI des Foto-Thumbnails
- `size`: Größe des Markers (default: 40)

## Next Steps

- [ ] Photo-Storage implementieren (AsyncStorage oder SQLite)
- [ ] Camera-Integration mit Location-Capture
- [ ] Marker-Clustering für viele Fotos
- [ ] Photo-Detail-Modal beim Marker-Click
- [ ] Offline-Map-Support

## Testing

### iOS Simulator
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

### Web (Fallback-Ansicht)
```bash
npm run web
```

**Wichtig:** 
- Location-Features funktionieren nur auf echten Geräten oder wenn du im Simulator/Emulator eine Location simulierst!
- Im Web wird nur eine Placeholder-Ansicht angezeigt (react-native-maps ist nicht web-kompatibel)

## Troubleshooting

### Web: "Importing native-only module" Error
- Das ist normal! `react-native-maps` funktioniert nicht im Web
- Die App lädt automatisch `photo-map-view.web.tsx` als Fallback
- Für volle Funktionalität nutze iOS oder Android

### Karte wird nicht angezeigt (Mobile)
- Prüfe ob Location-Permissions erteilt wurden
- Android: Prüfe ob Google Maps API Key korrekt ist
- iOS: Stelle sicher dass Maps in den Capabilities aktiviert ist

### Marker werden nicht angezeigt
- Prüfe ob `photos` Array valide Koordinaten enthält
- Prüfe Console für Fehler

### "User denied location permissions"
- Gehe in die System-Einstellungen und erlaube Location-Zugriff für die App
- iOS: Settings > Privacy > Location Services > Geo-Snap
- Android: Settings > Apps > Geo-Snap > Permissions