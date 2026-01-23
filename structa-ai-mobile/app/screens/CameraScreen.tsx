/**
 * Camera Screen - Document capture
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import { useCameraPermission } from '../../infra/camera';
import { scanWorkflow } from '../../domain/workflows';
import type { CameraScreenProps } from '../navigation/types';

export function CameraScreen({ navigation }: CameraScreenProps) {
  const cameraRef = useRef<CameraView>(null);
  const [capturing, setCapturing] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const { status, isLoading, requestPermission } = useCameraPermission();

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;

    setCapturing(true);
    try {
      // Start new scan on first capture
      if (pageCount === 0) {
        await scanWorkflow.startNewScan();
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (photo?.uri) {
        await scanWorkflow.addPage(photo.uri);
        setPageCount((c) => c + 1);
      }
    } catch (error) {
      console.error('Capture failed:', error);
    } finally {
      setCapturing(false);
    }
  };

  const handleDone = async () => {
    const state = scanWorkflow.getState();
    if (state.documentId) {
      navigation.replace('Processing', { documentId: state.documentId });
    } else {
      navigation.goBack();
    }
  };

  const handleCancel = () => {
    scanWorkflow.reset();
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4cc9f0" />
      </View>
    );
  }

  if (status !== 'granted') {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>
          Camera access is required to scan documents
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Document Frame Guide */}
          <View style={styles.frameGuide} />
        </View>

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.topBarText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.pageCounter}>
            {pageCount > 0 ? `${pageCount} page${pageCount > 1 ? 's' : ''}` : 'Ready to scan'}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomBar}>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.captureButton, capturing && styles.captureButtonDisabled]}
              onPress={handleCapture}
              disabled={capturing}
            >
              {capturing ? (
                <ActivityIndicator color="#1a1a2e" />
              ) : (
                <View style={styles.captureInner} />
              )}
            </TouchableOpacity>
          </View>

          {pageCount > 0 && (
            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneButtonText}>Done ({pageCount})</Text>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameGuide: {
    width: '85%',
    height: '60%',
    borderWidth: 2,
    borderColor: 'rgba(76, 201, 240, 0.5)',
    borderRadius: 12,
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  topBarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pageCounter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#4cc9f0',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4cc9f0',
  },
  doneButton: {
    marginTop: 20,
    backgroundColor: '#4cc9f0',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  doneButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#4cc9f0',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  cancelButtonText: {
    color: '#a0a0a0',
    fontSize: 16,
  },
});
