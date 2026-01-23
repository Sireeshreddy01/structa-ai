/**
 * Image preprocessing utilities
 */

import * as ImageManipulator from 'expo-image-manipulator';
import { AppConfig } from '../../config/app.config';

export interface PreprocessedImage {
  uri: string;
  width: number;
  height: number;
}

export interface PreprocessOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  rotate?: number;
}

/**
 * Preprocess image for upload
 * - Resize to max dimensions
 * - Compress for upload
 * - Apply rotation if needed
 */
export async function preprocessImage(
  uri: string,
  options: PreprocessOptions = {}
): Promise<PreprocessedImage> {
  const {
    maxWidth = AppConfig.upload.maxWidth,
    maxHeight = AppConfig.upload.maxHeight,
    quality = AppConfig.upload.compressionQuality,
    rotate,
  } = options;

  const actions: ImageManipulator.Action[] = [];

  // Add rotation if specified
  if (rotate) {
    actions.push({ rotate });
  }

  // Resize to fit within max dimensions
  actions.push({
    resize: {
      width: maxWidth,
      height: maxHeight,
    },
  });

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: quality,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
  };
}

/**
 * Apply basic image enhancements
 */
export async function enhanceImage(uri: string): Promise<PreprocessedImage> {
  // Future: Add contrast, brightness adjustments
  // For now, just return preprocessed image
  return preprocessImage(uri);
}
