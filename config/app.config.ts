/**
 * Application configuration
 */

import { Platform } from 'react-native';

// Use localhost on web, but actual IP for mobile devices
const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }
  // Your Mac's local IP - update this if it changes
  return process.env.EXPO_PUBLIC_API_URL || 'http://192.168.204.174:3000';
};

export const AppConfig = {
  // API Configuration
  api: {
    baseUrl: getApiUrl(),
    timeout: 30000,
  },

  // Upload Configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/heic'],
    compressionQuality: 0.8,
    maxWidth: 2048,
    maxHeight: 2048,
  },

  // Camera Configuration
  camera: {
    defaultRatio: '4:3',
    autoFocus: true,
  },

  // Polling Configuration
  polling: {
    interval: 2000, // 2 seconds
    maxAttempts: 60, // 2 minutes max
  },

  // Storage Keys
  storage: {
    documentsKey: '@structa/documents',
    uploadQueueKey: '@structa/upload-queue',
    settingsKey: '@structa/settings',
  },
} as const;

export type AppConfigType = typeof AppConfig;
