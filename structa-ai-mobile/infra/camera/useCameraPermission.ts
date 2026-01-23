/**
 * Camera permission hook
 */

import { useState, useEffect, useCallback } from 'react';
import { Camera } from 'expo-camera';

export type PermissionStatus = 'undetermined' | 'granted' | 'denied';

interface UseCameraPermissionResult {
  status: PermissionStatus;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
}

export function useCameraPermission(): UseCameraPermissionResult {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    setIsLoading(true);
    try {
      const { status: currentStatus } = await Camera.getCameraPermissionsAsync();
      setStatus(currentStatus === 'granted' ? 'granted' : 
                currentStatus === 'denied' ? 'denied' : 'undetermined');
    } catch (error) {
      console.error('Failed to check camera permission:', error);
      setStatus('undetermined');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { status: newStatus } = await Camera.requestCameraPermissionsAsync();
      const granted = newStatus === 'granted';
      setStatus(granted ? 'granted' : 'denied');
      return granted;
    } catch (error) {
      console.error('Failed to request camera permission:', error);
      setStatus('denied');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { status, isLoading, requestPermission };
}
