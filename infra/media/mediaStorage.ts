/**
 * Media Storage Service
 * Handles saving images to device media library
 */

import * as MediaLibrary from 'expo-media-library';
import { File, Directory, Paths } from 'expo-file-system';

export interface SaveToMediaResult {
  success: boolean;
  assetId?: string;
  error?: string;
}

/**
 * Save an image to the device's media library
 */
export async function saveToMediaLibrary(
  imageUri: string,
  albumName: string = 'Structa AI'
): Promise<SaveToMediaResult> {
  try {
    // Check permission
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        return { success: false, error: 'Media library permission denied' };
      }
    }

    // Create asset from URI
    const asset = await MediaLibrary.createAssetAsync(imageUri);

    // Try to add to album
    try {
      let album = await MediaLibrary.getAlbumAsync(albumName);
      if (!album) {
        album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
    } catch (albumError) {
      // Album creation might fail on some devices, but asset is still saved
      console.warn('Could not add to album:', albumError);
    }

    return { success: true, assetId: asset.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save to media library',
    };
  }
}

/**
 * Get recent assets from media library
 */
export async function getRecentAssets(
  count: number = 20
): Promise<MediaLibrary.Asset[]> {
  try {
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status !== 'granted') {
      return [];
    }

    const { assets } = await MediaLibrary.getAssetsAsync({
      first: count,
      mediaType: 'photo',
      sortBy: [MediaLibrary.SortBy.creationTime],
    });

    return assets;
  } catch (error) {
    console.error('Failed to get recent assets:', error);
    return [];
  }
}

/**
 * Delete an asset from media library
 */
export async function deleteFromMediaLibrary(assetId: string): Promise<boolean> {
  try {
    await MediaLibrary.deleteAssetsAsync([assetId]);
    return true;
  } catch (error) {
    console.error('Failed to delete asset:', error);
    return false;
  }
}

/**
 * Copy a file to the app's document directory for processing
 */
export async function copyToDocuments(
  sourceUri: string,
  filename: string
): Promise<string | null> {
  try {
    const destinationFile = new File(Paths.document, 'scans', filename);
    const sourceFile = new File(sourceUri);
    
    // Ensure parent directory exists
    const parentDir = destinationFile.parentDirectory;
    if (!(await parentDir.exists)) {
      await parentDir.create();
    }

    await sourceFile.copy(destinationFile);
    return destinationFile.uri;
  } catch (error) {
    console.error('Failed to copy to documents:', error);
    return null;
  }
}

/**
 * Get all scans stored in documents
 */
export async function getStoredScans(): Promise<string[]> {
  try {
    const scansDir = new Directory(Paths.document, 'scans');
    if (!(await scansDir.exists)) {
      return [];
    }

    const entries = await scansDir.list();
    return entries
      .filter((entry): entry is File => entry instanceof File)
      .map((file) => file.uri);
  } catch (error) {
    console.error('Failed to get stored scans:', error);
    return [];
  }
}

/**
 * Clear all temporary scan files
 */
export async function clearTempScans(): Promise<void> {
  try {
    const scansDir = new Directory(Paths.document, 'scans');
    if (await scansDir.exists) {
      await scansDir.delete();
    }
  } catch (error) {
    console.error('Failed to clear temp scans:', error);
  }
}
