# 🔧 Troubleshooting Guide - Geo-Snap

## Problem: Galerie ist leer und es wird nicht nach Berechtigungen gefragt

### Ursache
Nach dem Hinzufügen von `expo-media-library` und Änderungen an `app.json` muss die App neu gebaut werden, da native Module hinzugefügt wurden.

### Lösung

#### Schritt 1: Development Build erstellen

**Wichtig**: `expo-media-library` benötigt einen Development Build. Expo Go unterstützt nicht alle nativen Module!

```bash
# Stoppe die laufende App (Ctrl+C)

# Erstelle einen neuen Development Build
npx expo prebuild --clean

# Für iOS
npx expo run:ios

# Für Android
npx expo run:android
```

#### Schritt 2: App-Cache leeren (falls nötig)

```bash
# Cache leeren
npx expo start --clear

# Dann App neu starten
npx expo run:ios
# oder
npx expo run:android
```

#### Schritt 3: Berechtigungen manuell prüfen

Nach dem Neustart sollten beim ersten Öffnen des "Meine Fotos" Tabs automatisch die Berechtigungsdialoge erscheinen.

**iOS:**
1. Öffne die App
2. Gehe zum "Meine Fotos" Tab
3. Du solltest Dialoge sehen für:
   - "Zugriff auf Fotos erlauben?"
   - "Zugriff auf Standort erlauben?"

**Android:**
1. Öffne die App
2. Gehe zum "Meine Fotos" Tab
3. Du solltest Dialoge sehen für:
   - "Allow Geo-Snap to access photos and media?"
   - "Allow Geo-Snap to access this device's location?"

---

## Debug-Informationen anzeigen

Während der Entwicklung (Development Build) zeigt die App Debug-Informationen im Empty State:

- ✅/❌ Media Permission Status
- ✅/❌ Location Permission Status
- Anzahl gefundener Fotos
- Anzahl Location Groups
- Fehlermeldungen

### Console Logs überprüfen

Öffne die Metro Bundler Console oder Xcode/Android Studio Logs:

```bash
# Metro Bundler zeigt Logs automatisch
npx expo start

# Für iOS (Xcode Console)
# Oder nutze React Native Debugger
```

Du solltest folgende Logs sehen:
```
🚀 usePhotos hook initialized
🔐 Requesting permissions...
📷 Requesting media library permission...
📷 Media permission status: granted
📍 Requesting location permission...
📍 Location permission status: granted
✅ Permissions result: { media: true, location: true }
✅ All permissions granted, loading photos...
📸 Loading photos from media library...
📸 Found X total photos
📍 Found Y photos with location data
🗺️ Grouping Y photos by location...
✅ Created Z location groups
```

---

## Häufige Probleme

### 1. "Keine Fotos gefunden" obwohl Berechtigungen erteilt

**Mögliche Ursachen:**
- Deine Fotos haben keine Standortdaten (GPS-Daten)
- Standortdienste waren beim Aufnehmen der Fotos deaktiviert

**Lösung:**
- Erstelle Testfotos mit einer anderen Kamera-App (mit aktiviertem Standort)
- Oder nutze die Kamera-Funktion in Geo-Snap (wenn implementiert)

### 2. Berechtigungen werden nicht angefragt

**Mögliche Ursachen:**
- App läuft in Expo Go (nicht unterstützt)
- Native Module nicht gebaut

**Lösung:**
```bash
# Development Build erstellen
npx expo prebuild --clean
npx expo run:ios  # oder run:android
```

### 3. Berechtigungen wurden abgelehnt

**iOS:**
1. Gehe zu: Einstellungen → Geo-Snap
2. Aktiviere "Fotos" und "Standort"
3. App neu starten

**Android:**
1. Gehe zu: Einstellungen → Apps → Geo-Snap → Berechtigungen
2. Aktiviere "Fotos und Videos" und "Standort"
3. App neu starten

### 4. "Permission denied" Fehler

Berechtigungen wurden möglicherweise dauerhaft abgelehnt.

**Lösung:**
- Tippe auf "Berechtigungen erlauben" Button in der App
- Oder gehe zu den System-Einstellungen (siehe oben)
- App deinstallieren und neu installieren (setzt Berechtigungen zurück)

---

## Expo Go vs Development Build

### Expo Go (⚠️ Funktioniert NICHT für Media Library mit Location)

Expo Go ist begrenzt auf vorinstallierte Module und unterstützt nicht alle nativen Features.

### Development Build (✅ Empfohlen)

Ein Custom Development Build enthält alle nativen Module deiner App.

```bash
# Erstellen
npx expo prebuild
npx expo run:ios

# Danach kannst du normal entwickeln
npx expo start
```

---

## Systemanforderungen

### iOS
- iOS 13.0 oder höher
- Xcode 15 oder höher (für Build)
- Standortdienste aktiviert
- Kamera-Berechtigung in Fotos App aktiviert

### Android
- Android 6.0 (API 23) oder höher
- Standortdienste aktiviert
- Speicher-Berechtigungen

---

## Testen ohne echte Fotos

### iOS Simulator
Füge Test-Fotos mit Standort hinzu:
1. Öffne Fotos App im Simulator
2. Ziehe Bilder mit EXIF-Daten in den Simulator
3. Oder nutze Xcode → Debug → Location → Custom Location

### Android Emulator
1. Öffne Google Photos
2. Lade Test-Bilder mit GPS-Daten hoch
3. Oder nutze das Emulator Extended Controls Panel

---

## Weitere Hilfe

### Logs sammeln

```bash
# iOS
npx expo run:ios --configuration Debug

# Android
npx expo run:android --variant debug

# Oder nutze React Native Debugger
```

### Issues melden

Wenn das Problem weiterhin besteht:
1. Sammle die Console Logs
2. Screenshot der Debug-Info (im Dev Mode)
3. iOS/Android Version
4. Expo SDK Version: `npx expo --version`

---

## Schnell-Check

- [ ] Development Build erstellt? (`npx expo run:ios/android`)
- [ ] Nicht Expo Go verwendet?
- [ ] Berechtigungen in System-Einstellungen aktiviert?
- [ ] Fotos haben GPS-Daten?
- [ ] Console Logs überprüft?
- [ ] App neu gestartet nach Berechtigung?

---

**Wichtig**: Diese App funktioniert **NICHT** mit Expo Go! Du **MUSST** einen Development Build verwenden:

```bash
npx expo prebuild
npx expo run:ios    # oder run:android
```
