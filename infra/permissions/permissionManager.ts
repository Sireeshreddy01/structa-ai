/**
 * Permission Manager - Centralized permission handling
 * Manages all app permissions with consistent lifecycle
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';

export type PermissionType = 'camera' | 'mediaLibrary' | 'imagePicker';
export type PermissionStatus = 'undetermined' | 'granted' | 'denied' | 'limited';

export interface PermissionState {
  camera: PermissionStatus;
  mediaLibrary: PermissionStatus;
  imagePicker: PermissionStatus;
}

export interface UsePermissionsResult {
  permissions: PermissionState;
  isLoading: boolean;
  checkPermission: (type: PermissionType) => Promise<PermissionStatus>;
  requestPermission: (type: PermissionType) => Promise<boolean>;
  requestAllPermissions: () => Promise<boolean>;
  openSettings: () => Promise<void>;
}

const initialState: PermissionState = {
  camera: 'undetermined',
  mediaLibrary: 'undetermined',
  imagePicker: 'undetermined',
};

/**
 * Centralized permissions hook for all app permissions
 */
export function usePermissions(): UsePermissionsResult {
  const [permissions, setPermissions] = useState<PermissionState>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    setIsLoading(true);
    try {
      const [camera, mediaLibrary, imagePicker] = await Promise.all([
        checkCameraPermission(),
        checkMediaLibraryPermission(),
        checkImagePickerPermission(),
      ]);
      setPermissions({ camera, mediaLibrary, imagePicker });
    } finally {
      setIsLoading(false);
    }
  };

  const checkCameraPermission = async (): Promise<PermissionStatus> => {
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      return mapStatus(status);
    } catch {
      return 'undetermined';
    }
  };

  const checkMediaLibraryPermission = async (): Promise<PermissionStatus> => {
    try {
      const { status, accessPrivileges } = await MediaLibrary.getPermissionsAsync();
      if (accessPrivileges === 'limited') return 'limited';
      return mapStatus(status);
    } catch {
      return 'undetermined';
    }
  };

  const checkImagePickerPermission = async (): Promise<PermissionStatus> => {
    try {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      return mapStatus(status);
    } catch {
      return 'undetermined';
    }
  };

  const checkPermission = useCallback(async (type: PermissionType): Promise<PermissionStatus> => {
    switch (type) {
      case 'camera':
        return checkCameraPermission();
      case 'mediaLibrary':
        return checkMediaLibraryPermission();
      case 'imagePicker':
        return checkImagePickerPermission();
    }
  }, []);

  const requestPermission = useCallback(async (type: PermissionType): Promise<boolean> => {
    setIsLoading(true);
    try {
      let status: PermissionStatus;

      switch (type) {
        case 'camera': {
          const result = await Camera.requestCameraPermissionsAsync();
          status = mapStatus(result.status);
          break;
        }
        case 'mediaLibrary': {
          const result = await MediaLibrary.requestPermissionsAsync();
          status = result.accessPrivileges === 'limited' ? 'limited' : mapStatus(result.status);
          break;
        }
        case 'imagePicker': {
          const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
          status = mapStatus(result.status);
          break;
        }
      }

      setPermissions((prev) => ({ ...prev, [type]: status }));
      return status === 'granted' || status === 'limited';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestAllPermissions = useCallback(async (): Promise<boolean> => {
    const results = await Promise.all([
      requestPermission('camera'),
      requestPermission('mediaLibrary'),
    ]);
    return results.every(Boolean);
  }, [requestPermission]);

  const openSettings = useCallback(async () => {
    Alert.alert(
      'Permission Required',
      'Please enable the required permissions in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  }, []);

  return {
    permissions,
    isLoading,
    checkPermission,
    requestPermission,
    requestAllPermissions,
    openSettings,
  };
}

function mapStatus(status: string): PermissionStatus {
  switch (status) {
    case 'granted':
      return 'granted';
    case 'denied':
      return 'denied';
    default:
      return 'undetermined';
  }
}
