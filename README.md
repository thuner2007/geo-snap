# 📍 Geo-Snap

Eine minimalistische App zum Festhalten deiner Foto-Memories mit geografischem Bezug.

## 🎯 Konzept

SnapSpot macht es einfach, Fotos mit ihren Standorten zu verbinden und später zu erkunden. Statt in einer langweiligen Galerie rumzuscrollen, können User ihre Foto-Memories geografisch erleben:

- **Direktes Foto-Shooting**: User öffnen die App, machen ein Foto und fertig. Der Standort wird automatisch im Hintergrund gespeichert, ohne dass man etwas manuell eingeben muss.

- **Map-Visualisierung**: Alle Fotos werden als Pins auf einer interaktiven Karte angezeigt. So sieht man sofort wo man überall war.

- **Einfache Navigation**: Zwischen Liste und Karte switchen geht smooth. Man kann sich entweder alle Fotos chronologisch ansehen oder geografisch erkunden.

- **Minimalistisches Design**: Keine unnötigen Features die ablenken. Focus auf das Wesentliche: Foto machen, Ort speichern, auf Karte sehen.

## ✨ Features

### 🗺️ Karten-Ansicht (Home)
- Interaktive Karte mit allen Fotos als Pins
- Automatische Standorterkennung
- Zoom auf alle Foto-Locations
- Foto-Vorschau direkt auf der Karte

### 📸 Kamera
- Einfaches Foto-Shooting
- Automatische Standortspeicherung
- Direkt in die Galerie speichern

### 🖼️ Galerie (Meine Fotos)
- Fotos gruppiert nach Standorten
- Umschalten zwischen Listen- und Kartenansicht
- Anzeige von Ortsnamen durch Reverse Geocoding
- Pull-to-Refresh zum Aktualisieren
- Anzahl der Fotos pro Standort

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 oder höher)
- npm oder yarn
- Expo CLI
- iOS Simulator oder Android Emulator (optional)

### Installation

1. Installiere die Dependencies:
   ```bash
   npm install
   ```

2. Starte die App:
   ```bash
   npx expo start
   ```

3. Öffne die App in:
   - **iOS Simulator**: Drücke `i`
   - **Android Emulator**: Drücke `a`
   - **Expo Go App**: Scanne den QR-Code

### Berechtigungen

Die App benötigt folgende Berechtigungen:

- **📍 Standort**: Um Fotos geografisch zu verknüpfen
- **📷 Kamera**: Zum Aufnehmen von Fotos
- **🖼️ Galerie**: Zum Anzeigen und Speichern von Fotos

Diese werden beim ersten Start der jeweiligen Features angefordert.

## 🏗️ Projektstruktur

```
geo-snap/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home Screen (Karte)
│   │   ├── explore.tsx        # Galerie Screen
│   │   └── _layout.tsx        # Tab Navigation
│   ├── camera.tsx             # Kamera Screen
│   └── _layout.tsx            # Root Layout
├── components/
│   ├── map/
│   │   ├── photo-map-view.tsx    # Karten-Komponente
│   │   └── photo-marker.tsx      # Foto-Marker
│   └── ui/                       # UI Komponenten
├── hooks/
│   └── use-photos.ts          # Hook für Foto-Verwaltung
├── types/
│   └── photo.ts               # Shared Types
└── assets/                    # Bilder & Icons
```

## 🛠️ Technologie-Stack

- **Framework**: [Expo](https://expo.dev) / React Native
- **Navigation**: Expo Router (File-based routing)
- **Maps**: react-native-maps
- **Location**: expo-location
- **Media**: expo-media-library
- **Language**: TypeScript

## 📱 Screens

### 1. Home (Karte)
Zeigt alle Fotos auf einer interaktiven Karte. FAB-Button zum Öffnen der Kamera.

### 2. Meine Fotos (Galerie)
Liste aller Fotos gruppiert nach Standorten mit Toggle zur Kartenansicht.

### 3. Kamera
Einfacher Kamera-Screen zum Aufnehmen neuer Fotos.

## 🔧 Entwicklung

### Debugging

```bash
# Start mit Debug-Informationen
npx expo start --dev-client

# Logs anzeigen
npx expo start --ios --logs
npx expo start --android --logs
```

### Build für Production

```bash
# iOS
npx expo build:ios

# Android
npx expo build:android
```

## 🎨 Design-Prinzipien

1. **Minimalismus**: Nur die wichtigsten Features
2. **Intuitive Bedienung**: Keine Tutorials nötig
3. **Performance**: Schnelles Laden und flüssige Animationen
4. **Native Feel**: Platform-spezifische UI-Elemente

## 📝 Roadmap

- [ ] Foto-Detail-Ansicht mit Vollbild
- [ ] Fotos teilen
- [ ] Suche nach Orten
- [ ] Filter nach Datum/Ort
- [ ] Album-Funktion
- [ ] Export-Funktion

## 🤝 Contributing

Contributions sind willkommen! Bitte erstelle einen Pull Request.

## 📄 Lizenz

MIT License - siehe LICENSE Datei für Details

## 👤 Autor

Erstellt mit ❤️ für geografische Foto-Memories

---

**Happy Snapping! 📸🗺️**