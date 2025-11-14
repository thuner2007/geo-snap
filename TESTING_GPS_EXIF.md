# Testing Guide: GPS EXIF Functionality

## Quick Test Steps

### 1. Prerequisites
Before testing, ensure you have:
- ✅ Location permissions enabled on your device
- ✅ GPS enabled (Settings → Location)
- ✅ App installed on a real device (not emulator)
- ✅ Good GPS signal (test outdoors or near a window)

### 2. Basic Test Flow

1. **Open the app**
   ```bash
   npm run android
   # or
   npm run ios
   ```

2. **Grant permissions**
   - Allow camera access
   - Allow location access (When in use)
   - Allow media library access

3. **Take a photo**
   - Tap the camera button
   - Wait for GPS fix (check status bar)
   - Take a photo
   - You should see: "Photo saved with GPS location! 📍"

4. **Verify location was saved**
   - Open Google Photos (Android) or Photos app (iOS)
   - Find the photo you just took
   - Tap info icon or swipe up
   - You should see a map with the photo's location

## Detailed Testing Checklist

### Android Testing

#### Test 1: Basic GPS EXIF Embedding
- [ ] Open camera in the app
- [ ] Wait for location permission dialog
- [ ] Grant "While using the app" permission
- [ ] Take a photo outdoors
- [ ] Check console logs for:
  ```
  ✓ GPS EXIF data embedded successfully
  ✓ Photo saved to gallery
  ✓ GPS Coordinates saved: Lat X.XXXXXX, Lng Y.YYYYYY
  ```
- [ ] Open Google Photos
- [ ] View the photo
- [ ] Tap ⓘ (info icon) or swipe up
- [ ] Verify location appears on map

#### Test 2: Indoor/Poor GPS Signal
- [ ] Go indoors (away from windows)
- [ ] Take a photo
- [ ] Check if GPS coordinates were obtained
- [ ] If no GPS: Should save without error
- [ ] If GPS obtained: Should embed successfully

#### Test 3: Permission Denied
- [ ] Deny location permission
- [ ] Take a photo
- [ ] Should still save photo (without GPS)
- [ ] Should see: "Enable location permissions to tag photos"

#### Test 4: Verify with EXIF Reader App
- [ ] Install "Photo Exif Editor" from Play Store
- [ ] Open a photo taken with the app
- [ ] Check for GPS tags:
  - GPS Latitude
  - GPS Longitude
  - GPS Altitude
  - GPS Time Stamp
  - GPS Map Datum (should be "WGS-84")

### iOS Testing

#### Test 1: Basic GPS EXIF Embedding
- [ ] Open camera in the app
- [ ] Grant location permission
- [ ] Take a photo
- [ ] Open Photos app
- [ ] View the photo
- [ ] Swipe up to see details
- [ ] Verify location appears on map

#### Test 2: Check in Photos App
- [ ] Open Photos app
- [ ] Go to Albums → Places
- [ ] Your photo should appear on the map

### Console Log Verification

Look for these log messages when taking a photo:

```
✅ Success Indicators:
[EXIF Helper] Starting GPS EXIF embedding...
[EXIF Helper] Platform: android (or ios)
[EXIF Helper] Location: Lat X.XXX, Lng Y.YYY
[EXIF Helper] GPS EXIF tags prepared: [array of tags]
[EXIF Helper] GPS EXIF embedded successfully
✓ GPS EXIF data embedded successfully
✓ GPS EXIF verification successful
✓ Photo saved to gallery
✓ GPS Coordinates saved: Lat X.XXXXXX, Lng Y.YYYYYY

⚠️ Warning Messages (not errors):
⚠ Note: Location not accessible via MediaLibrary API
  This is normal on Android - EXIF data is still embedded in the file

❌ Error Messages to Watch For:
Failed to embed GPS EXIF: [error message]
Error embedding GPS EXIF: [error]
Permission denied
```

## Automated Verification Script

You can use this in your development tools console:

```javascript
// Test EXIF helper directly
import { embedGPSExif, verifyGPSExif } from '@/utils/exif-helper';

// Example test
const testLocation = {
  latitude: 51.5074,
  longitude: -0.1278,
  altitude: 11
};

// Embed and verify
const result = await embedGPSExif('file:///path/to/photo.jpg', testLocation);
console.log('Embed result:', result);

const verification = await verifyGPSExif(result.uri);
console.log('Verification:', verification);
```

## Common Issues & Solutions

### Issue: "Location not showing in Google Photos"

**Possible Causes:**
1. EXIF data not embedded
2. Google Photos hasn't indexed the photo yet
3. Location permission not granted
4. `ACCESS_MEDIA_LOCATION` permission missing

**Solutions:**
- Wait a few minutes for Google Photos to index
- Check app.json has `isAccessMediaLocationEnabled: true`
- Rebuild app: `npx expo prebuild --clean`
- Check logs for "✓ GPS EXIF data embedded successfully"

### Issue: "Permission denied" errors

**Solution:**
```bash
# Android: Clear app data and restart
adb shell pm clear com.anonymous.geosnap

# iOS: Reset permissions
Settings → Privacy → Location Services → GeoSnap → Reset
```

### Issue: "GPS coordinates not accurate"

**Causes:**
- Poor GPS signal
- Using "Low" accuracy setting
- Device location services disabled

**Solutions:**
- Test outdoors
- Enable High Accuracy mode in device settings
- Check that accuracy is set to `Balanced` or `High` in code

### Issue: "EXIF verification fails but photo saves"

**This is normal on Android!**
- MediaLibrary API doesn't expose EXIF location
- EXIF data IS still in the file
- Verify using Google Photos or EXIF reader app

## Performance Benchmarks

Expected timings (on mid-range device):

| Operation | Time |
|-----------|------|
| Get GPS location | 500ms - 3000ms |
| Take photo | 100ms - 500ms |
| Embed EXIF | 100ms - 300ms |
| Save to gallery | 200ms - 1000ms |
| **Total** | **~1-5 seconds** |

## Testing Different Scenarios

### Scenario 1: Quick Succession Photos
1. Take 5 photos rapidly
2. All should have GPS data
3. Location might be same for all (GPS didn't update)

### Scenario 2: Moving While Taking Photos
1. Take a photo at Location A
2. Walk 100m
3. Take a photo at Location B
4. Verify both photos have different coordinates

### Scenario 3: Airplane Mode
1. Enable airplane mode
2. Try to take photo
3. Should save without GPS (graceful degradation)

### Scenario 4: Background Permission
1. Give location permission "Always"
2. Take photo with app in foreground
3. Should work normally

## Debug Commands

### Android ADB Commands
```bash
# Check if photo has EXIF data
adb shell exiftool /sdcard/DCIM/Camera/GPS_PHOTO_*.jpg

# Pull photo to computer for analysis
adb pull /sdcard/DCIM/Camera/GPS_PHOTO_*.jpg ./

# Check app logs
adb logcat | grep -i "exif\|gps"

# Check permissions
adb shell dumpsys package com.anonymous.geosnap | grep permission
```

### iOS Commands
```bash
# View console logs
npx expo run:ios

# Check in Xcode
# Window → Devices and Simulators → View Device Logs
```

## Success Criteria

✅ Test is successful if:
1. Photo is taken without errors
2. Console shows "✓ GPS EXIF data embedded successfully"
3. Photo appears in Google Photos / Photos app
4. Location is visible when viewing photo details
5. EXIF reader app shows GPS tags
6. Coordinates match your actual location (±50m)

## Reporting Issues

If GPS EXIF is not working, provide:
1. Platform (Android/iOS) and version
2. Device model
3. Console logs from photo capture
4. Screenshot of photo info in gallery app
5. Output from EXIF reader app
6. app.json configuration (permissions section)

---

**Happy Testing! 📸📍**