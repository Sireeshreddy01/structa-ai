/**
 * Phase 3: Image Capture and Input Quality
 * Advanced image processing for optimal AI input
 */

import * as ImageManipulator from 'expo-image-manipulator';
import { File, Paths } from 'expo-file-system';
import { AppConfig } from '../../config/app.config';

export interface ImageQualityResult {
  uri: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  quality: number;
  processingTime: number;
}

export interface CropBounds {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  autoCrop?: boolean;
  normalizeOrientation?: boolean;
  enhanceContrast?: boolean;
}

const defaultOptions: ImageProcessingOptions = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.85,
  autoCrop: true,
  normalizeOrientation: true,
  enhanceContrast: false,
};

/**
 * Process image for optimal AI recognition
 */
export async function processForAI(
  uri: string,
  options: ImageProcessingOptions = {}
): Promise<ImageQualityResult> {
  const startTime = Date.now();
  const opts = { ...defaultOptions, ...options };
  const actions: ImageManipulator.Action[] = [];

  // Resize to max dimensions while maintaining aspect ratio
  actions.push({
    resize: {
      width: opts.maxWidth,
      height: opts.maxHeight,
    },
  });

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: opts.quality,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  const orientation: 'portrait' | 'landscape' =
    result.height > result.width ? 'portrait' : 'landscape';

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    orientation,
    quality: opts.quality ?? 0.85,
    processingTime: Date.now() - startTime,
  };
}

/**
 * Crop image to specified bounds
 */
export async function cropImage(
  uri: string,
  bounds: CropBounds
): Promise<ImageQualityResult> {
  const startTime = Date.now();

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ crop: bounds }],
    {
      compress: 0.9,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    orientation: result.height > result.width ? 'portrait' : 'landscape',
    quality: 0.9,
    processingTime: Date.now() - startTime,
  };
}

/**
 * Rotate image by specified degrees
 */
export async function rotateImage(
  uri: string,
  degrees: 90 | 180 | 270
): Promise<ImageQualityResult> {
  const startTime = Date.now();

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ rotate: degrees }],
    {
      compress: 0.9,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    orientation: result.height > result.width ? 'portrait' : 'landscape',
    quality: 0.9,
    processingTime: Date.now() - startTime,
  };
}

/**
 * Flip image horizontally or vertically
 */
export async function flipImage(
  uri: string,
  direction: 'horizontal' | 'vertical'
): Promise<ImageQualityResult> {
  const startTime = Date.now();

  const flip =
    direction === 'horizontal'
      ? { horizontal: true }
      : { vertical: true };

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ flip }],
    {
      compress: 0.9,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    orientation: result.height > result.width ? 'portrait' : 'landscape',
    quality: 0.9,
    processingTime: Date.now() - startTime,
  };
}

/**
 * Create multiple resolution versions of an image
 */
export async function createMultiResolution(
  uri: string
): Promise<{ thumbnail: string; medium: string; full: string }> {
  const [thumbnail, medium, full] = await Promise.all([
    ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 200 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
    ),
    ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    ),
    ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 2048 } }],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    ),
  ]);

  return {
    thumbnail: thumbnail.uri,
    medium: medium.uri,
    full: full.uri,
  };
}

/**
 * Validate image quality for processing
 */
export function validateImageQuality(
  width: number,
  height: number
): { valid: boolean; reason?: string } {
  const MIN_DIMENSION = 100;
  const MAX_DIMENSION = 8000;
  const MIN_AREA = 10000;

  if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
    return { valid: false, reason: 'Image too small for processing' };
  }

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    return { valid: false, reason: 'Image too large, will be resized' };
  }

  if (width * height < MIN_AREA) {
    return { valid: false, reason: 'Image area too small' };
  }

  return { valid: true };
}

/**
 * Calculate optimal compression based on file size target
 */
export function calculateOptimalCompression(
  currentSize: number,
  targetSize: number = 5 * 1024 * 1024 // 5MB default
): number {
  if (currentSize <= targetSize) return 0.95;
  
  const ratio = targetSize / currentSize;
  // Clamp between 0.3 and 0.95
  return Math.max(0.3, Math.min(0.95, ratio + 0.1));
}
