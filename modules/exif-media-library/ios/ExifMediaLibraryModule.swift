import ExpoModulesCore
import Photos
import CoreLocation
import ImageIO
import UniformTypeIdentifiers

public class ExifMediaLibraryModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExifMediaLibrary")

    /**
     * Saves a photo to the media library with GPS EXIF data preserved.
     * On iOS, we use PHPhotoLibrary which already preserves EXIF metadata.
     */
    AsyncFunction("savePhotoWithGPS") { (photoUri: String, gpsData: [String: Any]) -> [String: Any] in
      return try await withCheckedThrowingContinuation { continuation in
        // Extract GPS data
        guard let latitude = gpsData["latitude"] as? Double,
              let longitude = gpsData["longitude"] as? Double else {
          continuation.resume(returning: [
            "uri": "",
            "assetId": "",
            "success": false,
            "error": "Missing latitude or longitude"
          ])
          return
        }

        let altitude = gpsData["altitude"] as? Double ?? 0.0

        // Get file URL from URI
        guard let fileURL = URL(string: photoUri) else {
          continuation.resume(returning: [
            "uri": "",
            "assetId": "",
            "success": false,
            "error": "Invalid photo URI"
          ])
          return
        }

        // Check if file exists
        guard FileManager.default.fileExists(atPath: fileURL.path) else {
          continuation.resume(returning: [
            "uri": "",
            "assetId": "",
            "success": false,
            "error": "Photo file does not exist"
          ])
          return
        }

        // Add GPS EXIF to the image
        let imageWithGPS = addGPSExif(to: fileURL, latitude: latitude, longitude: longitude, altitude: altitude)

        // Save to Photos library
        PHPhotoLibrary.requestAuthorization { status in
          guard status == .authorized else {
            continuation.resume(returning: [
              "uri": "",
              "assetId": "",
              "success": false,
              "error": "Photos permission not granted"
            ])
            return
          }

          var assetId = ""
          var savedUri = ""

          PHPhotoLibrary.shared().performChanges({
            let request = PHAssetChangeRequest.creationRequestForAssetFromImage(atFileURL: imageWithGPS)

            // Set location
            request?.location = CLLocation(
              coordinate: CLLocationCoordinate2D(latitude: latitude, longitude: longitude),
              altitude: altitude,
              horizontalAccuracy: kCLLocationAccuracyBest,
              verticalAccuracy: kCLLocationAccuracyBest,
              timestamp: Date()
            )

            if let placeholder = request?.placeholderForCreatedAsset {
              assetId = placeholder.localIdentifier
            }
          }, completionHandler: { success, error in
            if success {
              // Clean up temp file if different from original
              if imageWithGPS != fileURL {
                try? FileManager.default.removeItem(at: imageWithGPS)
              }

              continuation.resume(returning: [
                "uri": savedUri,
                "assetId": assetId,
                "success": true
              ])
            } else {
              continuation.resume(returning: [
                "uri": "",
                "assetId": "",
                "success": false,
                "error": error?.localizedDescription ?? "Failed to save photo"
              ])
            }
          })
        }
      }
    }

    /**
     * Checks if a photo file has GPS EXIF data
     */
    AsyncFunction("hasGPSExif") { (photoUri: String) -> Bool in
      guard let fileURL = URL(string: photoUri),
            let imageSource = CGImageSourceCreateWithURL(fileURL as CFURL, nil),
            let properties = CGImageSourceCopyPropertiesAtIndex(imageSource, 0, nil) as? [String: Any],
            let gpsData = properties[kCGImagePropertyGPSDictionary as String] as? [String: Any] else {
        return false
      }

      return gpsData[kCGImagePropertyGPSLatitude as String] != nil &&
             gpsData[kCGImagePropertyGPSLongitude as String] != nil
    }

    /**
     * Reads GPS EXIF data from a photo file
     */
    AsyncFunction("readGPSExif") { (photoUri: String) -> [String: Any]? in
      guard let fileURL = URL(string: photoUri),
            let imageSource = CGImageSourceCreateWithURL(fileURL as CFURL, nil),
            let properties = CGImageSourceCopyPropertiesAtIndex(imageSource, 0, nil) as? [String: Any],
            let gpsData = properties[kCGImagePropertyGPSDictionary as String] as? [String: Any] else {
        return nil
      }

      guard let latitude = gpsData[kCGImagePropertyGPSLatitude as String] as? Double,
            let longitude = gpsData[kCGImagePropertyGPSLongitude as String] as? Double else {
        return nil
      }

      let latRef = gpsData[kCGImagePropertyGPSLatitudeRef as String] as? String ?? "N"
      let lonRef = gpsData[kCGImagePropertyGPSLongitudeRef as String] as? String ?? "E"
      let altitude = gpsData[kCGImagePropertyGPSAltitude as String] as? Double ?? 0.0

      let finalLat = latRef == "S" ? -latitude : latitude
      let finalLon = lonRef == "W" ? -longitude : longitude

      return [
        "latitude": finalLat,
        "longitude": finalLon,
        "altitude": altitude
      ]
    }
  }

  /**
   * Adds GPS EXIF data to an image file
   */
  private func addGPSExif(to fileURL: URL, latitude: Double, longitude: Double, altitude: Double) -> URL {
    guard let imageSource = CGImageSourceCreateWithURL(fileURL as CFURL, nil),
          let imageType = CGImageSourceGetType(imageSource) else {
      return fileURL
    }

    // Create a temporary file for the image with GPS
    let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("gps_\(UUID().uuidString).jpg")

    guard let imageDestination = CGImageDestinationCreateWithURL(tempURL as CFURL, imageType, 1, nil) else {
      return fileURL
    }

    // Get existing metadata
    var metadata = CGImageSourceCopyPropertiesAtIndex(imageSource, 0, nil) as? [String: Any] ?? [:]

    // Create GPS metadata
    let gpsMetadata: [String: Any] = [
      kCGImagePropertyGPSLatitude as String: abs(latitude),
      kCGImagePropertyGPSLatitudeRef as String: latitude >= 0 ? "N" : "S",
      kCGImagePropertyGPSLongitude as String: abs(longitude),
      kCGImagePropertyGPSLongitudeRef as String: longitude >= 0 ? "E" : "W",
      kCGImagePropertyGPSAltitude as String: abs(altitude),
      kCGImagePropertyGPSAltitudeRef as String: altitude >= 0 ? 0 : 1,
      kCGImagePropertyGPSTimeStamp as String: formatGPSTimeStamp(Date()),
      kCGImagePropertyGPSDateStamp as String: formatGPSDateStamp(Date()),
      kCGImagePropertyGPSMapDatum as String: "WGS-84"
    ]

    // Add GPS metadata
    metadata[kCGImagePropertyGPSDictionary as String] = gpsMetadata

    // Add image to destination with metadata
    if let imageRef = CGImageSourceCreateImageAtIndex(imageSource, 0, nil) {
      CGImageDestinationAddImage(imageDestination, imageRef, metadata as CFDictionary)
    }

    // Finalize
    guard CGImageDestinationFinalize(imageDestination) else {
      return fileURL
    }

    return tempURL
  }

  /**
   * Formats GPS timestamp
   */
  private func formatGPSTimeStamp(_ date: Date) -> String {
    let calendar = Calendar.current
    let components = calendar.dateComponents([.hour, .minute, .second], from: date)
    return String(format: "%02d:%02d:%02d", components.hour ?? 0, components.minute ?? 0, components.second ?? 0)
  }

  /**
   * Formats GPS datestamp
   */
  private func formatGPSDateStamp(_ date: Date) -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy:MM:dd"
    return formatter.string(from: date)
  }
}
