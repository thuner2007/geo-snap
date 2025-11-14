package expo.modules.exifmedialibrary

import android.content.ContentValues
import android.content.Context
import android.graphics.BitmapFactory
import android.location.Location
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.exifinterface.media.ExifInterface
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException

class ExifMediaLibraryModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExifMediaLibrary")

    /**
     * Saves a photo to the media library with GPS EXIF data preserved.
     * Uses Android's ExifInterface to write GPS coordinates before adding to MediaStore.
     */
    AsyncFunction("savePhotoWithGPS") { photoUri: String, gpsData: Map<String, Any> ->
      try {
        val context = appContext.reactContext ?: throw Exception("Context not available")

        // Extract GPS data from the map
        val latitude = (gpsData["latitude"] as? Number)?.toDouble()
          ?: throw Exception("Missing latitude")
        val longitude = (gpsData["longitude"] as? Number)?.toDouble()
          ?: throw Exception("Missing longitude")
        val altitude = (gpsData["altitude"] as? Number)?.toDouble() ?: 0.0

        // Parse the photo URI
        val sourceFile = getFileFromUri(photoUri)
        if (!sourceFile.exists()) {
          throw Exception("Source file does not exist: $photoUri")
        }

        // Create a temporary file with GPS EXIF embedded
        val tempFile = createTempFileWithGPS(sourceFile, latitude, longitude, altitude)

        // Save to MediaStore with the GPS-embedded file
        val savedUri = saveToMediaStore(context, tempFile)

        // Clean up temp file
        tempFile.delete()

        // Return result
        mapOf(
          "uri" to savedUri.toString(),
          "assetId" to getAssetIdFromUri(context, savedUri),
          "success" to true
        )
      } catch (e: Exception) {
        mapOf(
          "uri" to "",
          "assetId" to "",
          "success" to false,
          "error" to e.message
        )
      }
    }

    /**
     * Checks if a photo file has GPS EXIF data
     */
    AsyncFunction("hasGPSExif") { photoUri: String ->
      try {
        val file = getFileFromUri(photoUri)
        val exif = ExifInterface(file)
        val latLong = FloatArray(2)
        exif.getLatLong(latLong)
      } catch (e: Exception) {
        false
      }
    }

    /**
     * Reads GPS EXIF data from a photo file
     */
    AsyncFunction("readGPSExif") { photoUri: String ->
      try {
        val file = getFileFromUri(photoUri)
        val exif = ExifInterface(file)
        val latLong = FloatArray(2)

        if (exif.getLatLong(latLong)) {
          val altitude = exif.getAltitude(0.0)
          mapOf(
            "latitude" to latLong[0].toDouble(),
            "longitude" to latLong[1].toDouble(),
            "altitude" to altitude
          )
        } else {
          null
        }
      } catch (e: Exception) {
        null
      }
    }
  }

  /**
   * Converts a URI string to a File object
   */
  private fun getFileFromUri(uriString: String): File {
    val uri = Uri.parse(uriString)
    return when {
      uri.scheme == "file" -> File(uri.path ?: throw Exception("Invalid file path"))
      uri.scheme == "content" -> {
        // Handle content:// URIs by getting the actual file path
        val path = uri.path ?: throw Exception("Invalid content path")
        File(path)
      }
      else -> File(uriString.removePrefix("file://"))
    }
  }

  /**
   * Creates a temporary copy of the photo with GPS EXIF data embedded
   */
  private fun createTempFileWithGPS(
    sourceFile: File,
    latitude: Double,
    longitude: Double,
    altitude: Double
  ): File {
    // Create temp file
    val context = appContext.reactContext ?: throw Exception("Context not available")
    val tempFile = File(context.cacheDir, "gps_temp_${System.currentTimeMillis()}.jpg")

    // Copy source to temp
    FileInputStream(sourceFile).use { input ->
      FileOutputStream(tempFile).use { output ->
        input.copyTo(output)
      }
    }

    // Write GPS EXIF data using ExifInterface
    val exif = ExifInterface(tempFile.absolutePath)

    // Create Location object for ExifInterface
    val location = Location("camera").apply {
      setLatitude(latitude)
      setLongitude(longitude)
      setAltitude(altitude)
      time = System.currentTimeMillis()
    }

    // Set GPS coordinates using Location object
    exif.setGpsInfo(location)

    // Additional GPS metadata for better compatibility
    exif.setAttribute(ExifInterface.TAG_GPS_PROCESSING_METHOD, "HYBRID-FIX")
    exif.setAttribute(ExifInterface.TAG_GPS_MAP_DATUM, "WGS-84")

    // Save the EXIF data
    exif.saveAttributes()

    return tempFile
  }

  /**
   * Saves the photo file to Android's MediaStore
   */
  private fun saveToMediaStore(context: Context, photoFile: File): Uri {
    val contentValues = ContentValues().apply {
      put(MediaStore.Images.Media.DISPLAY_NAME, photoFile.name)
      put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
      put(MediaStore.Images.Media.DATE_ADDED, System.currentTimeMillis() / 1000)
      put(MediaStore.Images.Media.DATE_TAKEN, System.currentTimeMillis())

      // For Android 10+ (API 29+), use relative path
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_DCIM + "/GeoSnap")
        put(MediaStore.Images.Media.IS_PENDING, 1)
      }
    }

    val resolver = context.contentResolver
    val collection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
    } else {
      MediaStore.Images.Media.EXTERNAL_CONTENT_URI
    }

    // Insert the image
    val imageUri = resolver.insert(collection, contentValues)
      ?: throw IOException("Failed to create MediaStore entry")

    // Write the file data
    resolver.openOutputStream(imageUri)?.use { outputStream ->
      FileInputStream(photoFile).use { inputStream ->
        inputStream.copyTo(outputStream)
      }
    } ?: throw IOException("Failed to open output stream")

    // Mark as complete (Android 10+)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      contentValues.clear()
      contentValues.put(MediaStore.Images.Media.IS_PENDING, 0)
      resolver.update(imageUri, contentValues, null, null)
    }

    // CRITICAL: Re-write EXIF to the MediaStore file
    // This is necessary because MediaStore may strip EXIF during the copy
    try {
      resolver.openFileDescriptor(imageUri, "rw")?.use { pfd ->
        val exif = ExifInterface(pfd.fileDescriptor)
        val sourceExif = ExifInterface(photoFile.absolutePath)

        // Copy GPS EXIF attributes
        copyExifAttribute(sourceExif, exif, ExifInterface.TAG_GPS_LATITUDE)
        copyExifAttribute(sourceExif, exif, ExifInterface.TAG_GPS_LATITUDE_REF)
        copyExifAttribute(sourceExif, exif, ExifInterface.TAG_GPS_LONGITUDE)
        copyExifAttribute(sourceExif, exif, ExifInterface.TAG_GPS_LONGITUDE_REF)
        copyExifAttribute(sourceExif, exif, ExifInterface.TAG_GPS_ALTITUDE)
        copyExifAttribute(sourceExif, exif, ExifInterface.TAG_GPS_ALTITUDE_REF)
        copyExifAttribute(sourceExif, exif, ExifInterface.TAG_GPS_TIMESTAMP)
        copyExifAttribute(sourceExif, exif, ExifInterface.TAG_GPS_DATESTAMP)
        copyExifAttribute(sourceExif, exif, ExifInterface.TAG_GPS_PROCESSING_METHOD)
        copyExifAttribute(sourceExif, exif, ExifInterface.TAG_GPS_MAP_DATUM)

        exif.saveAttributes()
      }
    } catch (e: Exception) {
      // Log but don't fail - the photo is already saved
      println("Warning: Could not re-write EXIF to MediaStore: ${e.message}")
    }

    return imageUri
  }

  /**
   * Copies an EXIF attribute from source to destination
   */
  private fun copyExifAttribute(source: ExifInterface, dest: ExifInterface, tag: String) {
    val value = source.getAttribute(tag)
    if (value != null) {
      dest.setAttribute(tag, value)
    }
  }

  /**
   * Gets the asset ID from a MediaStore URI
   */
  private fun getAssetIdFromUri(context: Context, uri: Uri): String {
    val projection = arrayOf(MediaStore.Images.Media._ID)
    context.contentResolver.query(uri, projection, null, null, null)?.use { cursor ->
      if (cursor.moveToFirst()) {
        val idColumn = cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID)
        return cursor.getLong(idColumn).toString()
      }
    }
    return uri.lastPathSegment ?: ""
  }
}
