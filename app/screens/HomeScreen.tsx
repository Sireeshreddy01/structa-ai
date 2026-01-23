/**
 * Home Screen - Main entry point
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import type { HomeScreenProps } from '../navigation/types';
import { loadDocuments } from '../../infra/storage';
import type { DocumentSummary } from '../../domain/models';

export function HomeScreen({ navigation }: HomeScreenProps) {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocs();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDocs();
    });
    return unsubscribe;
  }, [navigation]);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const docs = await loadDocuments();
      // Filter out invalid entries
      const validDocs = (docs || []).filter(d => d && d.id);
      setDocuments(validDocs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      setDocuments([]);
    }
    setLoading(false);
  };

  const handleScanPress = () => {
    navigation.navigate('Camera');
  };

  const renderDocument = ({ item }: { item: DocumentSummary }) => {
    // Defensive check for invalid data
    if (!item || !item.id) return null;
    
    return (
      <View style={styles.documentCard}>
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>
            {item.title || `Scan ${item.id.slice(0, 8)}`}
          </Text>
          <Text style={styles.documentMeta}>
            {item.pageCount || 0} page{item.pageCount !== 1 ? 's' : ''} •{' '}
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown'}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.status === 'completed' && styles.statusCompleted,
            item.status === 'processing' && styles.statusProcessing,
            item.status === 'failed' && styles.statusFailed,
          ]}
        >
          <Text style={styles.statusText}>{item.status || 'pending'}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Structa AI</Text>
        <Text style={styles.subtitle}>
          Scan documents and convert to structured data
        </Text>
      </View>

      <TouchableOpacity style={styles.scanButton} onPress={handleScanPress}>
        <Text style={styles.scanButtonText}>📷 Scan Document</Text>
      </TouchableOpacity>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Scans</Text>
        {loading ? (
          <ActivityIndicator color="#4cc9f0" size="large" />
        ) : documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No documents yet</Text>
            <Text style={styles.emptySubtext}>
              Tap "Scan Document" to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={documents}
            renderItem={renderDocument}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: '#4cc9f0',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  scanButtonText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recentSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  documentCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#333',
  },
  statusCompleted: {
    backgroundColor: '#10b981',
  },
  statusProcessing: {
    backgroundColor: '#f59e0b',
  },
  statusFailed: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#a0a0a0',
  },
});
