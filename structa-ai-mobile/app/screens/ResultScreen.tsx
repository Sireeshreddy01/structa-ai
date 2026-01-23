/**
 * Result Screen - Display structured results
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import type { ResultScreenProps } from '../navigation/types';
import type { Block } from '../../domain/models';
import { exportDocument, shareExport, ExportFormat } from '../../domain/services';

export function ResultScreen({ navigation, route }: ResultScreenProps) {
  const { document } = route.params;
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setExporting(true);
    try {
      const result = await exportDocument(document, format);
      if (result.success && result.uri) {
        await shareExport(result.uri);
      } else {
        Alert.alert('Export Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Export Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setExporting(false);
    }
  };

  const handleDone = () => {
    navigation.popToTop();
  };

  const renderBlock = (block: Block, index: number) => {
    switch (block.type) {
      case 'text':
      case 'number':
        return (
          <View key={block.id || index} style={styles.textBlock}>
            <Text style={styles.blockContent}>{String(block.content)}</Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>
                {Math.round(block.confidence * 100)}%
              </Text>
            </View>
          </View>
        );

      case 'table':
        const tableData = block.content as string[][];
        return (
          <View key={block.id || index} style={styles.tableBlock}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                {tableData.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.tableRow}>
                    {row.map((cell, cellIndex) => (
                      <View
                        key={cellIndex}
                        style={[
                          styles.tableCell,
                          rowIndex === 0 && styles.tableHeader,
                        ]}
                      >
                        <Text
                          style={[
                            styles.cellText,
                            rowIndex === 0 && styles.headerText,
                          ]}
                        >
                          {cell}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Extraction Results</Text>
          <Text style={styles.subtitle}>
            {document.blocks.length} block{document.blocks.length !== 1 ? 's' : ''} extracted
          </Text>
        </View>

        <View style={styles.blocksContainer}>
          {document.blocks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No content extracted</Text>
            </View>
          ) : (
            document.blocks.map((block, index) => renderBlock(block, index))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.exportButtons}>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => handleExport('text')}
            disabled={exporting}
          >
            <Text style={styles.exportButtonText}>📄 Text</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => handleExport('csv')}
            disabled={exporting}
          >
            <Text style={styles.exportButtonText}>📊 CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => handleExport('json')}
            disabled={exporting}
          >
            <Text style={styles.exportButtonText}>{ } JSON</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  blocksContainer: {
    gap: 16,
  },
  textBlock: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  blockContent: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  confidenceBadge: {
    backgroundColor: '#4cc9f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  tableBlock: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    minWidth: 100,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  tableHeader: {
    backgroundColor: '#252542',
  },
  cellText: {
    color: '#fff',
    fontSize: 14,
  },
  headerText: {
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  footer: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    paddingBottom: 40,
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#252542',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: '#4cc9f0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
