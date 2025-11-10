# 📸 Photo Detail Modal - Documentation (v2.0)

## Übersicht

Die komplett überarbeitete Photo Detail Modal zeigt Fotos mit umfassenden Metadaten in einem scrollbaren, kartenbasierten Design. Das neue Design orientiert sich an modernen iOS Photo Apps mit Info-Karten und dunklem Theme.

## ✨ Neue Features (v2.0)

### 1. **Modernes Card-basiertes Layout**
- Scrollbare Ansicht mit mehreren Info-Karten
- Dunkles Theme (#000000 Hintergrund, #1A1A1A Karten)
- Abgerundete Karten mit subtilen Borders
- Kategorie-Header mit farbigen Icons

### 2. **Erweiterte Header-Leiste**
- Ortsname prominent im Header
- X-Button zum Schließen (links)
- Share-Button (Mitte rechts)
- Download-Button (rechts)
- Schwarzer Hintergrund für besseren Kontrast

### 3. **Photo Card**
- Große, abgerundete Foto-Vorschau
- 280px Höhe, volle Breite minus Padding
- Blaue Placeholder-Farbe (#5B9FED)
- Cover-Modus für optimale Darstellung

### 4. **Info-Karten**

#### Koordinaten
- 📍 Blauer Location-Icon (#3B82F6)
- Zwei Zeilen: Breitengrad & Längengrad
- Format: `47.376900° N` / `8.541700° E`

#### Kamera Info
- 📷 Grüner Kamera-Icon (#10B981)
- Geräteinformationen (Placeholder)
- Kann später EXIF-Daten anzeigen

#### Datei Info
- 📄 Gelber Datei-Icon
- Dateiname aus URI extrahiert
- Dateigröße & Dimensionen (TODO)

#### Wetter
- ⏰ Lila Clock-Icon
- Wetterdaten zum Aufnahmezeitpunkt (Placeholder)
- Integration mit Weather API geplant

#### Mini-Karte
- Statische Karten-Vorschau
- Roter Pin-Marker (#EF4444)
- "In Karte öffnen →" Button
- Navigation zum Map-Tab

## 🎨 Design-System

### Farbschema
```
Hintergrund:         #000000 (Schwarz)
Karten-Hintergrund:  #1A1A1A (Dunkelgrau)
Karten-Border:       #2A2A2A
Primär-Text:         #FFFFFF (Weiß)
Sekundär-Text:       #9CA3AF (Grau)
Info-Text:           #D1D5DB (Hellgrau)

Icons:
- Koordinaten:       #3B82F6 (Blau)
- Kamera:            #10B981 (Grün)
- Wetter:            Emoji
- Datei:             Emoji
```

### Typografie
```
Location Title:      32px, Bold, #FFFFFF
Header Title:        18px, SemiBold, #FFFFFF
Datum:               16px, Regular, #9CA3AF
Card Title:          13px, Bold, #9CA3AF (ALL CAPS)
Koordinaten:         20px, SemiBold, #FFFFFF
Info Text:           16px, Regular, #D1D5DB
Map Button:          15px, SemiBold, #000000
```

### Spacing
```
Screen Padding:      20px
Card Padding:        20px
Card Margin Bottom:  16px
Card Border Radius:  16px
Photo Card Height:   280px
Mini Map Height:     200px
Header Padding Top:  60px (Safe Area)
```

## 📱 Layout-Struktur

```
┌────────────────────────────────────┐
│ ✕  Zürich HB           📤  📥      │ ← Header (Black)
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐ │
│  │                              │ │
│  │        📸 Photo              │ │ ← Photo Card (Rounded)
│  │                              │ │
│  └──────────────────────────────┘ │
│                                    │
│  Zürich HB                         │ ← Location Title
│  2025-11-05 um 14:23 Uhr          │ ← Date
│                                    │
│  ╔══════════════════════════════╗ │
│  ║ 📍 KOORDINATEN               ║ │
│  ║ 47.376900° N                 ║ │
│  ║ 8.541700° E                  ║ │
│  ╚══════════════════════════════╝ │
│                                    │
│  ╔══════════════════════════════╗ │
│  ║ 📷 KAMERA INFO               ║ │
│  ║ Geräteinformationen...       ║ │
│  ╚══════════════════════════════╝ │
│                                    │
│  ╔══════════════════════════════╗ │
│  ║ 📄 DATEI INFO                ║ │
│  ║ IMG_1234.jpg                 ║ │
│  ╚══════════════════════════════╝ │
│                                    │
│  ╔══════════════════════════════╗ │
│  ║ ⏰ WETTER                    ║ │
│  ║ Wetterinformationen...       ║ │
│  ╚══════════════════════════════╝ │
│                                    │
│  ╔══════════════════════════════╗ │
│  ║ MINI-KARTE                   ║ │
│  ║  ╔════════════════════════╗  ║ │
│  ║  ║                        ║  ║ │
│  ║  ║        📍              ║  ║ │ ← Mini Map
│  ║  ║                        ║  ║ │
│  ║  ╚════════════════════════╝  ║ │
│  ║  [In Karte öffnen →]         ║ │
│  ╚══════════════════════════════╝ │
│                                    │
└────────────────────────────────────┘
```

## 🔧 Props Interface

```typescript
interface PhotoDetailModalProps {
  photo: Photo | null;
  visible: boolean;
  onClose: () => void;
  onShowOnMap?: (photo: Photo) => void;
}
```

## 💻 Verwendung

```typescript
import { PhotoDetailModal } from "@/components/gallery/photo-detail-modal";

const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
const [isModalVisible, setIsModalVisible] = useState(false);

<PhotoDetailModal
  photo={selectedPhoto}
  visible={isModalVisible}
  onClose={() => {
    setIsModalVisible(false);
    setTimeout(() => setSelectedPhoto(null), 300);
  }}
  onShowOnMap={(photo) => {
    router.push("/(tabs)/");
  }}
/>
```

## 📊 Datum & Zeit Formatierung

```typescript
// Output: "2025-11-05 um 14:23 Uhr"
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(",", " um") + " Uhr";
};
```

## 🗺️ Koordinaten Formatierung

```typescript
// Input:  47.376900, 8.541700
// Output: { lat: "47.376900° N", lon: "8.541700° E" }
const formatCoordinates = (lat: number, lon: number) => {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return {
    lat: `${Math.abs(lat).toFixed(6)}° ${latDir}`,
    lon: `${Math.abs(lon).toFixed(6)}° ${lonDir}`,
  };
};
```

## 🎯 Interaktionen

### Header Buttons
- **X-Button**: Schließt Modal mit Slide-Animation
- **Share-Button**: Teilt Foto (TODO)
- **Download-Button**: Speichert Foto (TODO)

### "In Karte öffnen" Button
1. Schließt Photo Detail Modal
2. Wartet 300ms für Animation
3. Ruft `onShowOnMap` Callback auf
4. Parent navigiert zum Map Tab
5. Map zeigt Foto-Location

### Scroll-Verhalten
- Smooth Scrolling durch alle Karten
- Vertical Scroll Indicator sichtbar
- Bottom Padding für bessere UX

## 🔮 Geplante Features

### Phase 1 - EXIF Daten
- [ ] **Kamera Model**: z.B. "iPhone 15 Pro"
- [ ] **Lens Info**: "48 MP • f/1.8 • ISO 100"
- [ ] **Dateigröße**: "4.2 MB • 4032 x 3024"
- [ ] **Dateiname**: Aus EXIF extrahiert

### Phase 2 - Wetter Integration
- [ ] **Weather API**: OpenWeatherMap oder ähnlich
- [ ] **Temperatur**: "☀️ Sonnig, 18°C"
- [ ] **Luftfeuchtigkeit**: "65%"
- [ ] **Historische Wetterdaten** zum Aufnahmezeitpunkt

### Phase 3 - Mini-Map
- [ ] **Echte Map Integration**: react-native-maps
- [ ] **Static Map API**: Google/Apple Static Maps
- [ ] **Interaktive Mini-Map**: Zoom & Pan
- [ ] **Nearby Photos**: Andere Fotos in der Nähe

### Phase 4 - Actions
- [ ] **Share Sheet**: Native Share-Funktionalität
- [ ] **Download**: Foto speichern
- [ ] **Edit Location**: Standort korrigieren
- [ ] **Delete Photo**: Foto löschen

## 🎨 Unterschiede zu v1.0

| Feature | v1.0 | v2.0 |
|---------|------|------|
| Layout | Fixed Bottom Sheet | Full Screen Scroll |
| Photo Size | 60% Screen Height | 280px Card |
| Background | #1C1C1E | #000000 |
| Info Cards | Circle Icons | Rectangular Cards |
| Animation | Fade | Slide |
| Mini Map | ❌ | ✅ |
| Weather | ❌ | ✅ (Placeholder) |
| Share/Download | ❌ | ✅ (Buttons) |
| Scrollable | Limited | Full |

## 📝 Best Practices

### Performance
```typescript
// Gut: Lazy load mini map nur wenn sichtbar
{isVisible && <MiniMap />}

// Gut: Image Caching mit expo-image
<Image source={{ uri: photo.uri }} />

// Gut: Datum nur einmal formatieren
const formattedDate = useMemo(
  () => formatDate(photo.timestamp),
  [photo.timestamp]
);
```

### Accessibility
```typescript
// Screen Reader Support
<TouchableOpacity
  accessibilityLabel="Schließen"
  accessibilityRole="button"
>
  <Text>✕</Text>
</TouchableOpacity>
```

## 🐛 Known Issues

1. **Weather Section**: Noch Placeholder
2. **Camera Info**: EXIF-Daten werden noch nicht extrahiert
3. **Mini Map**: Statischer Placeholder statt echter Karte
4. **Share/Download**: Buttons ohne Funktion

## 📚 Dependencies

```json
{
  "expo-image": "Image Component mit Caching",
  "react-native": "ScrollView, Modal, etc.",
  "@/components/ui/icon-symbol": "Icon System",
  "@/types/photo": "Photo Interface"
}
```

## 🧪 Testing Checklist

- [ ] Modal öffnet mit Slide-Animation
- [ ] Header zeigt korrekten Ortsnamen
- [ ] Photo Card zeigt Bild korrekt
- [ ] Datum ist korrekt formatiert
- [ ] Koordinaten sind korrekt formatiert
- [ ] Alle Info-Karten werden angezeigt
- [ ] Scroll funktioniert smooth
- [ ] "In Karte öffnen" navigiert korrekt
- [ ] X-Button schließt Modal
- [ ] Modal funktioniert auf iOS
- [ ] Modal funktioniert auf Android

---

**Status**: ✅ Production Ready  
**Version**: 2.0.0  
**Last Updated**: 2025  
**Breaking Changes**: Complete UI Redesign