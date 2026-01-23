/**
 * Enhanced Camera Service
 * Advanced camera features for document scanning
 */

import { Camera, CameraView, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { RefObject } from 'react';

export interface CameraSettings {
  facing: CameraType;
  flash: FlashMode;
  zoom: number;
  autoFocus: boolean;
}

export interface CaptureOptions {
  quality?: number;
  skipProcessing?: boolean;
  exif?: boolean;
}

export interface CapturedPhoto {
  uri: string;
  width: number;
  height: number;
  exif?: Record<string, any>;
}

export const defaultCameraSettings: CameraSettings = {
  facing: 'back',
  flash: 'auto',
  zoom: 0,
  autoFocus: true,
};

/**
 * Capture a photo using the camera
 */
export async function capturePhoto(
  cameraRef: RefObject<CameraView>,
  options: CaptureOptions = {}
): Promise<CapturedPhoto | null> {
  if (!cameraRef.current) {
    console.error('Camera reference not available');
    return null;
  }

  try {
    const photo = await cameraRef.current.takePictureAsync({
      quality: options.quality ?? 0.85,
      skipProcessing: options.skipProcessing ?? false,
      exif: options.exif ?? true,
    });

    if (!photo) return null;

    return {
      uri: photo.uri,
      width: photo.width,
      height: photo.height,
      exif: photo.exif,
    };
  } catch (error) {
    console.error('Failed to capture photo:', error);
    return null;
  }
}

/**
 * Pick an image from the device gallery
 */
export async function pickImageFromGallery(): Promise<CapturedPhoto | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
      exif: true,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      exif: asset.exif ?? undefined,
    };
  } catch (error) {
    console.error('Failed to pick image:', error);
    return null;
  }
}

/**
 * Pick multiple images from gallery
 */
export async function pickMultipleImages(
  maxCount: number = 10
): Promise<CapturedPhoto[]> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: maxCount,
      quality: 0.85,
      exif: true,
    });

    if (result.canceled || !result.assets) {
      return [];
    }

    return result.assets.map((asset) => ({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      exif: asset.exif ?? undefined,
    }));
  } catch (error) {
    console.error('Failed to pick images:', error);
    return [];
  }
}

/**
 * Get available camera types
 */
export async function getAvailableCameraTypes(): Promise<CameraType[]> {
  // In expo-camera v17+, both front and back are typically available
  return ['front', 'back'];
}

/**
 * Check if device has camera
 */
export async function hasCamera(): Promise<boolean> {
  try {
    const { status } = await Camera.getCameraPermissionsAsync();
    // If we can query permissions, camera exists
    return true;
  } catch {
    return false;
  }
}
