/**
 * Export Format Settings Screen
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, SectionTitle, RadioOption, ActionButton } from './components';
import { PROFILE_COLORS } from './theme';

interface ExportFormatScreenProps {
  onBack: () => void;
}

type ExportFormat = 'pdf' | 'docx' | 'xlsx' | 'txt' | 'json';

export function ExportFormatScreen({ onBack }: ExportFormatScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [loading, setLoading] = useState(false);

  const formats: { id: ExportFormat; name: string; description: string }[] = [
    {
      id: 'pdf',
      name: 'PDF Document',
      description: 'Portable Document Format - Best for sharing',
    },
    {
      id: 'docx',
      name: 'Word Document',
      description: 'Microsoft Word - Best for editing',
    },
    {
      id: 'xlsx',
      name: 'Excel Spreadsheet',
      description: 'Microsoft Excel - Best for tabular data',
    },
    {
      id: 'txt',
      name: 'Plain Text',
      description: 'Simple text file - Most compatible',
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'Structured data - Best for developers',
    },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 500));
      Alert.alert('Success', 'Default export format updated', [
        { text: 'OK', onPress: onBack }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Export Format" onBack={onBack} />

        <View style={styles.section}>
          <SectionTitle title="Default Format" />
          <View style={styles.formatList}>
            {formats.map(format => (
              <RadioOption
                key={format.id}
                label={format.name}
                description={format.description}
                selected={selectedFormat === format.id}
                onSelect={() => setSelectedFormat(format.id)}
              />
            ))}
          </View>
        </View>

        <ActionButton
          label={loading ? 'Saving...' : 'Save Preference'}
          onPress={handleSave}
          disabled={loading}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  formatList: {
    gap: 12,
  },
});
