# 📸 Gallery Features - Geo-Snap

## Übersicht

Die Galerie-Funktion von Geo-Snap zeigt alle lokalen Fotos aus der Gerätegalerie an, die GPS-Standortdaten enthalten. Die Fotos werden in einer übersichtlichen Grid-Ansicht dargestellt, wobei jedes Foto seinen Aufnahmeort anzeigt.

## ✨ Hauptfunktionen

### 1. **Foto-Galerie mit Grid-Layout**
- 3-Spalten Grid-Design für optimale Übersicht
- Responsive Layout passt sich der Bildschirmgröße an
- Farbige Platzhalter für leere Grid-Slots
- Smooth Scrolling durch alle Fotos

### 2. **Lokale Fotos mit GPS-Daten**
- Lädt automatisch alle Fotos aus der Gerätegalerie
- Filtert nur Fotos mit GPS-Metadaten (EXIF)
- Zeigt maximal 100 neueste Fotos
- Reverse Geocoding für lesbare Ortsnamen

### 3. **Location-Integration**
- Automatische Extraktion von GPS-Koordinaten aus EXIF-Daten
- Reverse Geocoding für lesbare Ortsnamen (z.B. "Zürich HB")
- Location-Overlay auf jedem Foto mit Pin-Icon
- Geografische Visualisierung auf interaktiver Karte

### 4. **Permissions Management**
- **Media Library Zugriff**: Zum Lesen lokaler Fotos
- **Standort-Zugriff**: Für Reverse Geocoding
- Benutzerfreundliche Permission-Screens mit klaren Erklärungen
- Automatisches Laden nach Permission-Grant

## 🏗️ Architektur

### Komponenten-Struktur

```
geo-snap/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Karten-Ansicht
│   │   └── explore.tsx            # Galerie-Ansicht
│   └── camera.tsx                 # Placeholder (In Development)
├── components/
│   ├── gallery/
│   │   ├── photo-gallery-view.tsx    # Grid-Layout Komponente
│   │   └── photo-gallery-header.tsx  # Header mit Foto-Counter
│   └── map/
│       ├── photo-map-view.tsx        # Karten-Darstellung
│       └── photo-marker.tsx          # Custom Marker
├── hooks/
│   └── use-photos.ts              # Photo Loading Hook
└── types/
    └── photo.ts                   # Shared Photo Type
```

### Datenfluss

1. **Fotos laden**:
   ```
   App Start → Check Permissions → MediaLibrary.getAssetsAsync() 
   → Filter by GPS → Reverse Geocoding → Update State → UI Render
   ```

2. **Permissions**:
   ```
   App Start → Check Permissions → Request if needed → Load Photos
   ```

3. **Karten-Integration**:
   ```
   Photos State → Map Component → Display as Markers
   ```

## 📦 Daten-System

### Photo-Objekt Struktur
```typescript
interface Photo {
  id: string;              // Asset ID from MediaLibrary
  uri: string;             // Local file URI
  latitude: number;        // GPS Koordinate (EXIF)
  longitude: number;       // GPS Koordinate (EXIF)
  timestamp: number;       // Aufnahme-Zeitpunkt
  locationName?: string;   // Lesbarer Ortsname (Reverse Geocoding)
}
```

### Datenquelle
- **Quelle**: Lokale Gerätegalerie (expo-media-library)
- **Filter**: Nur Fotos mit GPS-Koordinaten
- **Limit**: 100 neueste Fotos
- **Sortierung**: Neueste zuerst (creationTime)
- **Persistence**: Keine - lädt immer aus MediaLibrary

## 🎨 UI/UX Design

### Galerie-Ansicht
- **Header**: "Meine Fotos" + Foto-Counter
- **Grid**: 3 Spalten, responsive Höhe (1:1.3 ratio)
- **Photo Cards**: 
  - Foto-Preview aus lokaler Galerie
  - Farbige Platzhalter für leere Slots
  - Location-Overlay am unteren Rand (schwarz, 75% Transparenz)
  - Pin-Icon + Ortsname
- **Empty State**: Freundliche Nachricht wenn keine Fotos mit GPS gefunden

### Farbschema für Platzhalter
```
Rotation durch 8 Farben:
- #5CA6E8 (Blau)
- #4ECB71 (Grün)
- #A77BCA (Lila)
- #FF9955 (Orange)
- #6B4423 (Braun)
- #E8E8E8 (Hellgrau)
- #CCCCCC (Grau)
- #999999 (Dunkelgrau)
```

### Permission Screens
- Zentrales Layout mit Icon (photo.fill)
- Klare Erklärungstexte
- Prominent platzierter "Zugriff erlauben" Button
- Loading-State während Permission-Check

### Empty State
- Icon + "Noch keine Fotos"
- Hilfreicher Text: Fotos mit GPS-Daten benötigt
- Alternative: Kamera-Feature verwenden (in Entwicklung)

## 🔧 API-Verwendung

### Expo-Module

1. **expo-media-library**
   ```typescript
   // Galerie-Zugriff und Foto-Laden
   MediaLibrary.getAssetsAsync({
     mediaType: 'photo',
     first: 100,
     sortBy: [[MediaLibrary.SortBy.creationTime, false]]
   });
   
   // EXIF-Daten mit GPS-Koordinaten
   MediaLibrary.getAssetInfoAsync(asset);
   ```

2. **expo-location**
   ```typescript
   // Reverse Geocoding (Koordinaten → Ortsnamen)
   Location.reverseGeocodeAsync({ latitude, longitude });
   ```

3. **react-native-maps**
   - Karten-Visualisierung
   - Foto-Marker-Darstellung
   - Auto-Zoom auf alle Foto-Locations

## 🚀 Verwendung

### Fotos ansehen
```typescript
1. User öffnet Galerie-Tab
2. App prüft Media Library Permission
3. Falls nicht vorhanden: Permission-Screen
4. User erlaubt Zugriff
5. App lädt 100 neueste Fotos aus Galerie
6. Filtert Fotos mit GPS-Koordinaten
7. Führt Reverse Geocoding durch
8. Zeigt Grid mit Fotos + Locations
```

### Karten-Ansicht
```typescript
1. User öffnet Karten-Tab
2. Verwendet gleiche Foto-Daten (usePhotos Hook)
3. Zeigt Fotos als Pins auf Karte
4. Map zoomt automatisch um alle Pins zu zeigen
5. Tap auf Pin → Detail-View (TODO)
```

## 🎯 Best Practices

### Performance
- Limit auf 100 Fotos für schnelles Laden
- expo-image für optimiertes Caching
- Lazy Reverse Geocoding (nur für sichtbare Fotos)
- Einmaliges Laden bei App-Start

### User Experience
- Klare Permission-Erklärungen
- Loading States für async Operations
- Empty States mit hilfreichen Hinweisen
- Smooth Grid-Scrolling

### Privacy
- Nur Lesezugriff auf Galerie (keine Schreibrechte)
- Keine Cloud-Uploads
- Keine externe Speicherung
- GPS-Daten bleiben lokal

### Code-Qualität
- Shared Type Definitions (DRY)
- Custom Hook für wiederverwendbare Logik
- Separation of Concerns
- TypeScript für Type Safety

## 📋 Wichtige Hinweise

### GPS-Metadaten
- Nicht alle Fotos haben GPS-Daten
- Kamera-App muss Location-Tagging aktiviert haben
- iOS: Einstellungen → Kamera → Standort
- Android: Kamera → Einstellungen → Standort speichern

### Foto-Limit
- Aktuell: 100 neueste Fotos
- Erweiterbar über `first` Parameter
- Pagination für große Sammlungen (TODO)

### Reverse Geocoding
- Benötigt Internet-Verbindung
- Fallback: GPS-Koordinaten als Text
- Rate Limits beachten bei vielen Fotos

## 🔮 Geplante Features (TODO)

- [ ] Foto-Detail Modal mit Vollbild-Ansicht
- [ ] Pagination für mehr als 100 Fotos
- [ ] Filter nach Zeitraum oder Ort
- [ ] Suche nach Location-Namen
- [ ] Foto-Clustering auf der Karte
- [ ] Export/Share-Funktion
- [ ] Offline-Caching von Location-Namen
- [ ] Album-Filter

## 🤝 Team-Aufteilung

### Galerie (Dieser Branch)
✅ Media Library Integration
✅ GPS-Daten Extraktion
✅ Grid-Ansicht
✅ Karten-Integration
✅ Permission Management

### Kamera (Anderer Branch)
⏳ Kamera-Aufnahme
⏳ Live-Preview
⏳ GPS-Tagging beim Fotografieren
⏳ Speicherung in Galerie

## 🧪 Testing

```bash
# Development Server starten
npm start

# iOS Simulator
npm run ios

# Android Emulator/Device
npm run android
```

### Test-Szenarien
1. **Ohne Permission**: Permission-Screen wird angezeigt
2. **Keine GPS-Fotos**: Empty State wird angezeigt
3. **Mit GPS-Fotos**: Grid mit Locations wird angezeigt
4. **Karten-Ansicht**: Pins an korrekten Positionen

### Testdaten generieren
- Fotos mit GPS-Daten machen
- Oder: Test-Fotos mit EXIF-Daten importieren
- iOS Simulator: Drag & Drop Fotos

## 📱 Platform-Spezifisches

### iOS
- Permission-Dialog: System-Standard
- Maps: Apple Maps (native)
- EXIF-Zugriff: Vollständig

### Android
- Permission-Dialog: Runtime Permissions
- Maps: Google Maps (API Key erforderlich)
- EXIF-Zugriff: Vollständig
- READ_MEDIA_IMAGES für Android 13+

### Web
- Karten-Ansicht: Placeholder mit Info
- Media Library: Nicht verfügbar
- Nur mobile Plattformen unterstützt

---

**Status**: ✅ Fully Functional (ohne Kamera-Feature)  
**Version**: 1.0.0  
**Last Updated**: 2024