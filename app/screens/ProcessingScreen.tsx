/**
 * Processing Screen - Shows processing status
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { scanWorkflow } from '../../domain/workflows';
import type { ProcessingScreenProps } from '../navigation/types';

export function ProcessingScreen({ navigation, route }: ProcessingScreenProps) {
  const [status, setStatus] = useState('Processing your document...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    processDocument();
  }, []);

  const processDocument = async () => {
    const unsubscribe = scanWorkflow.subscribe((state) => {
      if (state.progress !== undefined) {
        setProgress(state.progress);
      }

      switch (state.state) {
        case 'waiting':
          setStatus('Analyzing document...');
          break;
        case 'completed':
          setStatus('Complete!');
          break;
        case 'error':
          setStatus(state.error || 'Processing failed');
          break;
      }
    });

    try {
      const document = await scanWorkflow.finishScan();
      
      if (document) {
        navigation.replace('Result', { document });
      } else {
        // Handle error - go back
        setTimeout(() => {
          navigation.popToTop();
        }, 2000);
      }
    } finally {
      unsubscribe();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#4cc9f0" style={styles.spinner} />
        
        <Text style={styles.status}>{status}</Text>
        
        {progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}

        <Text style={styles.hint}>
          This may take a moment depending on the document complexity
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 24,
  },
  status: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  progressContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4cc9f0',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#a0a0a0',
  },
  hint: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
