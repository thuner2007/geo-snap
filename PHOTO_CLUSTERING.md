# 📍 Photo Clustering - Documentation

## Übersicht

Das Photo Clustering Feature gruppiert Fotos, die am selben oder sehr nahen Ort aufgenommen wurden, um eine bessere Übersicht auf der Karte zu bieten und alle Fotos an einem Standort anzuzeigen.

## ✨ Problem & Lösung

### Problem
Wenn mehrere Fotos am exakt gleichen Ort (oder sehr nah beieinander) aufgenommen werden, würde auf der Karte nur ein Marker angezeigt werden, und die anderen Fotos wären nicht sichtbar.

### Lösung
- **Gruppierung**: Fotos innerhalb von 50 Metern werden zu einer Gruppe zusammengefasst
- **Badge-Anzeige**: Marker zeigen die Anzahl der Fotos mit einem roten Badge
- **Location Group Modal**: Beim Tap öffnet sich eine Übersicht aller Fotos an diesem Ort
- **Foto-Auswahl**: User kann dann ein spezifisches Foto auswählen für Details

## 🏗️ Architektur

### Komponenten

```
geo-snap/
├── lib/
│   └── photo-grouping.ts                      # Clustering Logic
├── components/
│   ├── gallery/
│   │   └── photo-location-group-modal.tsx     # Group Overview Modal
│   └── map/
│       └── photo-map-view.tsx                 # Updated Map with Groups
```

## 📦 Datenstrukturen

### PhotoGroup Interface
```typescript
interface PhotoGroup {
  latitude: number;      // Zentrale Koordinate der Gruppe
  longitude: number;     // Zentrale Koordinate der Gruppe
  photos: Photo[];       // Alle Fotos in dieser Gruppe
  locationName?: string; // Name des Standorts
}
```

## 🔧 Clustering-Algorithmus

### Haversine Distance Formula
Berechnet die tatsächliche Entfernung zwischen zwei GPS-Koordinaten auf der Erdkugel:

```typescript
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
```

### Grouping Logic
```typescript
export function groupPhotosByLocation(photos: Photo[]): PhotoGroup[] {
  const groups: PhotoGroup[] = [];
  const THRESHOLD = 50; // meters

  for (const photo of photos) {
    let addedToGroup = false;

    // Try to add to existing group
    for (const group of groups) {
      const distance = calculateDistance(
        photo.latitude,
        photo.longitude,
        group.latitude,
        group.longitude
      );

      if (distance <= THRESHOLD) {
        group.photos.push(photo);
        addedToGroup = true;
        break;
      }
    }

    // Create new group if not in range of any existing group
    if (!addedToGroup) {
      groups.push({
        latitude: photo.latitude,
        longitude: photo.longitude,
        photos: [photo],
        locationName: photo.locationName,
      });
    }
  }

  return groups;
}
```

## 🎯 User Flow

### Szenario 1: Einzelnes Foto an einem Ort
```
1. Marker ohne Badge wird angezeigt
2. User tippt auf Marker
3. Photo Detail Modal öffnet sich direkt
```

### Szenario 2: Mehrere Fotos am gleichen Ort
```
1. Marker mit rotem Badge (z.B. "3") wird angezeigt
2. User tippt auf Marker
3. Photo Location Group Modal öffnet sich
4. Zeigt 3x3 Grid mit allen Fotos an diesem Ort
5. User wählt ein Foto aus
6. Photo Detail Modal öffnet sich für das gewählte Foto
```

## 🎨 UI Design

### Map Marker Badge
- **Position**: Oben rechts am Marker
- **Farbe**: #FF3B30 (Rot)
- **Border**: 2px weiß für bessere Sichtbarkeit
- **Text**: Weiß, Bold, Anzahl der Fotos
- **Größe**: 20x20px (minimum)

### Location Group Modal
- **Style**: Bottom Sheet
- **Animation**: Slide up
- **Background**: Semi-transparentes Overlay
- **Header**: Location-Name mit Pin-Icon
- **Grid**: 3 Spalten, quadratische Thumbnails
- **Photo Count**: "X Fotos an diesem Ort"

## 🔧 Konfiguration

### Threshold Distance
```typescript
const LOCATION_THRESHOLD_METERS = 50;
```

Kann angepasst werden für:
- **Genauer** (10-25m): Mehr separate Marker, z.B. für verschiedene Gebäude
- **Großzügiger** (100-200m): Weniger Marker, z.B. für ganze Stadtteile

## 📊 Performance

### Komplexität
- **Time**: O(n × m) wobei n = Anzahl Fotos, m = Anzahl Gruppen
- **Space**: O(n) für gruppierte Struktur
- **Optimierung**: Früher Break bei gefundener Gruppe

### Best Practices
```typescript
// Gut: Fotos werden einmal gruppiert
useEffect(() => {
  const groups = groupPhotosByLocation(photos);
  setPhotoGroups(groups);
}, [photos]);

// Schlecht: Gruppierung bei jedem Render
const groups = groupPhotosByLocation(photos); // In Component Body
```

## 🧪 Testing

### Test-Szenarien
1. **Keine Fotos**: Keine Marker
2. **Ein Foto**: Marker ohne Badge
3. **Zwei Fotos, gleicher Ort**: Marker mit Badge "2"
4. **Zwei Fotos, 100m Abstand**: Zwei separate Marker
5. **Viele Fotos, ein Ort**: Badge mit korrekter Anzahl

### Edge Cases
- Fotos auf beiden Seiten des Äquators
- Fotos auf beiden Seiten des Nullmeridians
- Sehr nahe Koordinaten (< 1 Meter)
- Sehr viele Fotos an einem Ort (> 100)

## 🎓 Beispiele

### Typische Use Cases

#### Stadtbesuch
```
Zürich HB: 5 Fotos
- Haupthalle
- Bahnhofstraße
- Shopville
- Treffpunkt
- Ausgang
```

#### Event/Konzert
```
Hallenstadion: 12 Fotos
- Alle vom gleichen Event
- Verschiedene Momente
- Badge zeigt "12"
```

#### Wanderung
```
Uetliberg: 3 Fotos
Felsenegg: 2 Fotos
Separate Marker (> 50m Abstand)
```

## 🔮 Zukünftige Erweiterungen

- [ ] **Cluster Animation**: Smooth expand/collapse
- [ ] **Heatmap Mode**: Dichte-Visualisierung
- [ ] **Timeline in Group**: Fotos chronologisch sortiert
- [ ] **Group Statistics**: Zeitspanne, Wetter, etc.
- [ ] **Smart Grouping**: ML-basierte Location-Erkennung
- [ ] **Custom Threshold**: User kann Distanz einstellen

---

**Status**: ✅ Fully Functional  
**Version**: 1.0.0  
**Last Updated**: 2024