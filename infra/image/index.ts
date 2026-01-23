export { preprocessImage, enhanceImage } from './preprocessor';
export type { PreprocessedImage, PreprocessOptions } from './preprocessor';

export {
  processForAI,
  cropImage,
  rotateImage,
  flipImage,
  createMultiResolution,
  validateImageQuality,
  calculateOptimalCompression,
} from './imageQuality';
export type {
  ImageQualityResult,
  CropBounds,
  ImageProcessingOptions,
} from './imageQuality';

export {
  createSession,
  addPageToSession,
  removePageFromSession,
  reorderPages,
  finalizeSession,
  getSessionSummary,
} from './multiPageScanner';
export type { PageCapture, MultiPageSession } from './multiPageScanner';
