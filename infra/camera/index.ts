export { useCameraPermission } from './useCameraPermission';
export type { PermissionStatus } from './useCameraPermission';

export {
  capturePhoto,
  pickImageFromGallery,
  pickMultipleImages,
  getAvailableCameraTypes,
  hasCamera,
  defaultCameraSettings,
} from './cameraService';
export type {
  CameraSettings,
  CaptureOptions,
  CapturedPhoto,
} from './cameraService';
