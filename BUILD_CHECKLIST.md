# Build & Test Checklist - Native GPS EXIF Module

## 🎯 Goal
Build and test the native GPS EXIF module to ensure photos save with location data on Android.

---

## Pre-Build Checklist

### Environment Setup
- [ ] Node.js 18+ installed
- [ ] Android Studio installed (for Android)
- [ ] Xcode 14+ installed (for iOS - Mac only)
- [ ] Real Android device connected (NOT emulator - GPS needed)
- [ ] USB debugging enabled on device
- [ ] Device recognized: `adb devices` shows your device

### Project Preparation
- [ ] Navigate to project: `cd geo-snap`
- [ ] Dependencies installed: `npm install` completed successfully
- [ ] No syntax errors: `npx tsc --noEmit` passes
- [ ] Git committed (recommended): `git status` clean or changes committed

---

## Build Process

### Step 1: Clean Previous Builds
```bash
# Remove old native code
rm -rf android ios

# Clear Metro cache (optional but recommended)
npx expo start -c
```

- [ ] `android/` directory removed
- [ ] `ios/` directory removed
- [ ] No errors during cleanup

### Step 2: Generate Native Projects (Prebuild)
```bash
npx expo prebuild --clean
```

**Expected output:**
```
✔ Config synced
✔ Created native directories
✔ Updated native configuration
```

- [ ] Command completes without errors
- [ ] `android/` directory created
- [ ] `ios/` directory created (if on Mac)
- [ ] Module auto-linked (check logs for "exif-media-library")

### Step 3: Verify Module Linking

**Android:**
```bash
grep -r "exif-media-library" android/settings.gradle
```

- [ ] Module appears in settings.gradle

**Check module exists:**
```bash
ls -la modules/exif-media-library/android/
```

- [ ] `build.gradle` exists
- [ ] `src/` directory exists with Kotlin code

### Step 4: Build and Install

**Android:**
```bash
npx expo run:android
```

**Expected console output:**
```
› Building app...
› Installing APK...
› Starting Metro...
› Opening app on device...
```

- [ ] Build completes without errors
- [ ] APK installs on device
- [ ] App launches successfully
- [ ] Metro bundler starts

**iOS (if on Mac):**
```bash
cd ios
pod install
cd ..
npx expo run:ios
```

- [ ] Pods install successfully
- [ ] Build completes
- [ ] App launches on device/simulator

---

## Testing Checklist

### Grant Permissions
When app opens:

- [ ] Camera permission requested → **Grant "While using the app"**
- [ ] Location permission requested → **Grant "While using the app"** or **"Only this time"**
- [ ] Media Library permission requested → **Grant "Allow"**

### Take Test Photo

**Setup:**
- [ ] Go outdoors or near window (GPS signal needed)
- [ ] Wait for GPS icon in status bar (if visible)
- [ ] Open camera in app

**Capture:**
- [ ] Tap camera button in app
- [ ] Wait for camera to load
- [ ] Tap capture button
- [ ] Wait for processing (1-2 seconds)

### Verify Console Logs

**Success indicators:**
```
✓ Taking picture...
✓ Photo captured, processing...
✓ Saving to gallery with GPS EXIF...
✓ GPS Data - Lat: XX.XXXXXX, Lng: YY.YYYYYY, Alt: ZZZ.Z
✓ Using native ExifMediaLibrary module...
✓ Photo saved to gallery with GPS EXIF!
✓ Asset ID: 12345
✓✓ GPS EXIF VERIFIED in gallery photo!
  Lat: XX.XXXXXX, Lng: YY.YYYYYY
```

- [ ] Console shows "Using native ExifMediaLibrary module"
- [ ] Console shows "Photo saved to gallery with GPS EXIF!"
- [ ] Console shows "GPS EXIF VERIFIED in gallery photo!"
- [ ] GPS coordinates displayed match your approximate location
- [ ] No error messages in console
- [ ] Success alert appears on device

**Warning signs (investigate if seen):**
- ❌ "Module not found: ExifMediaLibrary" → Using Expo Go (need dev build)
- ❌ "Native module save failed" → Check native code compilation
- ❌ "Falling back to standard MediaLibrary" → Module not working
- ❌ "Location permission denied" → Grant permissions

### Verify in Google Photos (Android)

**Open Google Photos:**
- [ ] Open Google Photos app
- [ ] Navigate to Photos tab
- [ ] Find photo just taken (should be at top)
- [ ] Tap on photo to open it
- [ ] Tap ⓘ (info icon) OR swipe up from bottom

**Check for location:**
- [ ] **Map appears showing location** ✅ (SUCCESS!)
- [ ] Pin on map matches where you took photo
- [ ] Address shown (approximate location)
- [ ] Coordinates visible (optional in some versions)

**If no location shown:**
- [ ] Wait 1-2 minutes (Google Photos needs to index)
- [ ] Close and reopen Google Photos
- [ ] Check console logs showed GPS was saved
- [ ] Try EXIF Reader app verification (below)

### Verify with EXIF Reader App (Alternative Method)

**Install EXIF Reader:**
- [ ] Install "Photo Exif Editor" from Google Play Store
- [ ] Open the app
- [ ] Browse to DCIM/GeoSnap folder or select photo

**Check GPS tags:**
- [ ] Open EXIF view
- [ ] Navigate to GPS section
- [ ] **GPS Latitude present** ✅
- [ ] **GPS Longitude present** ✅
- [ ] **GPS Altitude present** ✅
- [ ] GPS Map Datum = "WGS-84" ✅
- [ ] Coordinates match your location

### iOS Verification (if tested on iOS)

**Photos App:**
- [ ] Open Photos app
- [ ] Select photo
- [ ] Swipe up from bottom
- [ ] **Location appears on map** ✅
- [ ] Photo appears in "Places" album

---

## Edge Cases Testing

### Test Without GPS
- [ ] Turn off location in device settings
- [ ] Take photo
- [ ] Console shows "No location available - saving photo without GPS data"
- [ ] Photo saves successfully (without GPS)
- [ ] No errors or crashes

### Test Indoors (Poor GPS Signal)
- [ ] Take photo indoors
- [ ] GPS may take longer (10-30 seconds)
- [ ] Photo should still save (with or without GPS)
- [ ] No crashes if GPS timeout

### Test Multiple Photos
- [ ] Take 3-5 photos in quick succession
- [ ] All photos save successfully
- [ ] Console shows GPS for each photo
- [ ] Google Photos shows location for all

### Test Permission Denial
- [ ] Deny camera permission → Should show error, not crash
- [ ] Deny location permission → Should save without GPS
- [ ] Deny media library permission → Should show error

---

## Performance Check

Expected timings (on Samsung Galaxy S23 or similar):

- [ ] Photo capture: < 500ms
- [ ] GPS acquisition: 500ms - 5000ms (varies by signal)
- [ ] EXIF embedding + save: < 500ms
- [ ] Total (excluding GPS wait): < 2 seconds
- [ ] No UI freezing or lag
- [ ] No memory leaks (test 10+ photos)

---

## Error Troubleshooting

### If Build Fails

**Error: "Module not found"**
- [ ] Delete `node_modules`: `rm -rf node_modules`
- [ ] Reinstall: `npm install`
- [ ] Prebuild again: `npx expo prebuild --clean`

**Error: Gradle build failed**
- [ ] Clean Gradle: `cd android && ./gradlew clean && cd ..`
- [ ] Rebuild: `npx expo run:android`

**Error: "Cannot find ExifMediaLibraryModule.kt"**
- [ ] Check file exists: `ls modules/exif-media-library/android/src/main/java/expo/modules/exifmedialibrary/`
- [ ] Verify module structure intact

### If App Crashes on Launch

- [ ] Check logcat: `adb logcat | grep -i error`
- [ ] Look for native module errors
- [ ] Ensure all permissions granted
- [ ] Try uninstall and reinstall: `adb uninstall com.anonymous.geosnap`

### If GPS Not Preserved

**Check console logs:**
- [ ] Says "Using native ExifMediaLibrary module"? (Should say YES)
- [ ] Says "GPS EXIF VERIFIED"? (Should say YES)
- [ ] Shows actual GPS coordinates? (Should show numbers)

**Verify in code:**
- [ ] `camera.tsx` imports from `'exif-media-library'`
- [ ] Calls `savePhotoWithGPS()` not `createAssetAsync()`
- [ ] Passes GPS data object with lat/lng/alt

**Test with EXIF Reader:**
- [ ] Install Photo Exif Editor
- [ ] Check if GPS tags exist in file
- [ ] If YES = module works, Google Photos may need time to index
- [ ] If NO = native module not saving GPS correctly

---

## Production Readiness

### Before Deployment

- [ ] All tests pass
- [ ] No console errors
- [ ] GPS verified in Google Photos
- [ ] Tested on multiple Android versions (if possible)
- [ ] Tested on iOS (if applicable)
- [ ] Battery usage acceptable
- [ ] No memory leaks
- [ ] User experience smooth

### EAS Build Preparation

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure
```

- [ ] EAS CLI installed
- [ ] Logged in to Expo account
- [ ] `eas.json` configured

### Production Build

```bash
# Development build (for testing)
eas build --platform android --profile development

# Production build (for Play Store)
eas build --platform android --profile production
```

- [ ] Development build completes
- [ ] Test development build on device
- [ ] GPS still works in dev build
- [ ] Ready for production build

---

## Final Verification

### Success Criteria

All of these MUST be true:

✅ **Build**: App builds and installs without errors
✅ **Module**: Console shows "Using native ExifMediaLibrary module"  
✅ **Save**: Console shows "Photo saved to gallery with GPS EXIF!"  
✅ **Verify**: Console shows "GPS EXIF VERIFIED in gallery photo!"  
✅ **Google Photos**: Location appears on map when viewing photo  
✅ **EXIF Reader**: GPS tags present in photo metadata  
✅ **No Errors**: No crashes, no error messages  
✅ **Performance**: Photo save completes in < 2 seconds  

If all ✅ above = **READY FOR PRODUCTION!** 🎉

---

## Next Steps After Testing

### Immediate
- [ ] Test on additional devices (if available)
- [ ] Document any issues found
- [ ] Create bug reports for any failures

### Short Term
- [ ] Deploy to internal testers
- [ ] Gather feedback
- [ ] Monitor crash reports
- [ ] Check GPS preservation rate

### Long Term
- [ ] Deploy to Google Play Store
- [ ] Monitor user reviews
- [ ] Track feature usage analytics
- [ ] Plan additional EXIF features (camera model, etc.)

---

## Support & Documentation

### If You Need Help

1. **Read docs first:**
   - `START_HERE.md` - Overview
   - `QUICKSTART_NATIVE.md` - 5 min guide
   - `NATIVE_MODULE_SETUP.md` - Detailed setup

2. **Check console logs:**
   - Very descriptive error messages
   - Shows exact step that failed

3. **Verify with tools:**
   - Google Photos (primary method)
   - Photo Exif Editor (verification)
   - adb logcat (native errors)

4. **Common issues:**
   - Not using dev build → Need `expo run:android`, not Expo Go
   - Emulator → Need real device for GPS
   - Permissions → Must grant camera + location + media
   - Poor GPS → Test outdoors first

---

## Checklist Summary

**Before Building:**
- [ ] Environment ready
- [ ] Dependencies installed
- [ ] Device connected

**Building:**
- [ ] Prebuild completed
- [ ] Module linked
- [ ] App installed

**Testing:**
- [ ] Permissions granted
- [ ] Photo taken
- [ ] GPS in console logs
- [ ] Location in Google Photos
- [ ] EXIF tags verified

**Production:**
- [ ] All tests pass
- [ ] Ready for deployment

---

**Status**: ___ / 50 items completed

**Result**: 
- [ ] ✅ SUCCESS - GPS preserved, ready for production
- [ ] ⚠️ PARTIAL - Works but needs fixes
- [ ] ❌ FAILED - See troubleshooting section

**Date**: _______________
**Tester**: _______________
**Device**: _______________

---

🎉 **When all checked: YOU'RE DONE! Deploy to production!** 🚀