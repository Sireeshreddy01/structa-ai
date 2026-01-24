/**
 * Library Screen - View all scanned documents
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  TextInput,
  Animated,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#FAFAFA',
  white: '#FFFFFF',
  black: '#111111',
  textPrimary: '#111111',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  accentBlue: '#DBEAFE',
  accentGreen: '#DCFCE7',
  accentYellow: '#FEF3C7',
  accentPurple: '#EDE9FE',
  accentRed: '#FEE2E2',
  accentCyan: '#CFFAFE',
  success: '#22C55E',
  orange: '#F97316',
};

// Document type icons and colors
const DOCUMENT_TYPES: Record<string, { icon: keyof typeof MaterialIcons.glyphMap; color: string; bg: string }> = {
  pdf: { icon: 'picture-as-pdf', color: '#DC2626', bg: COLORS.accentRed },
  doc: { icon: 'description', color: '#2563EB', bg: COLORS.accentBlue },
  spreadsheet: { icon: 'table-chart', color: '#16A34A', bg: COLORS.accentGreen },
  image: { icon: 'image', color: '#9333EA', bg: COLORS.accentPurple },
  receipt: { icon: 'receipt', color: '#EA580C', bg: COLORS.accentYellow },
  id: { icon: 'badge', color: '#0891B2', bg: COLORS.accentCyan },
};

interface Document {
  id: string;
  name: string;
  type: keyof typeof DOCUMENT_TYPES;
  date: Date;
  pages: number;
  size: string;
  thumbnail?: string;
  tags?: string[];
}

interface LibraryScreenProps {
  onBack: () => void;
  onDocumentPress?: (doc: Document) => void;
}

export function LibraryScreen({ onBack, onDocumentPress }: LibraryScreenProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    // Simulated documents - in production, fetch from API
    const mockDocs: Document[] = [
      {
        id: '1',
        name: 'Invoice #2024-001',
        type: 'receipt',
        date: new Date('2026-01-24'),
        pages: 1,
        size: '245 KB',
        tags: ['invoice', 'business'],
      },
      {
        id: '2',
        name: 'Contract Agreement',
        type: 'pdf',
        date: new Date('2026-01-23'),
        pages: 12,
        size: '1.2 MB',
        tags: ['legal', 'important'],
      },
      {
        id: '3',
        name: 'Financial Report Q4',
        type: 'spreadsheet',
        date: new Date('2026-01-22'),
        pages: 8,
        size: '856 KB',
        tags: ['finance', 'quarterly'],
      },
      {
        id: '4',
        name: 'Passport Scan',
        type: 'id',
        date: new Date('2026-01-21'),
        pages: 2,
        size: '1.5 MB',
        tags: ['personal', 'id'],
      },
      {
        id: '5',
        name: 'Meeting Notes',
        type: 'doc',
        date: new Date('2026-01-20'),
        pages: 3,
        size: '128 KB',
        tags: ['work', 'notes'],
      },
      {
        id: '6',
        name: 'Product Photos',
        type: 'image',
        date: new Date('2026-01-19'),
        pages: 5,
        size: '4.2 MB',
        tags: ['photos', 'product'],
      },
      {
        id: '7',
        name: 'Tax Documents 2025',
        type: 'pdf',
        date: new Date('2026-01-18'),
        pages: 24,
        size: '3.1 MB',
        tags: ['tax', 'important'],
      },
      {
        id: '8',
        name: 'Restaurant Receipt',
        type: 'receipt',
        date: new Date('2026-01-17'),
        pages: 1,
        size: '98 KB',
        tags: ['expense', 'food'],
      },
    ];
    setDocuments(mockDocs);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  };

  const filters = [
    { id: 'all', label: 'All', icon: 'folder' as const },
    { id: 'recent', label: 'Recent', icon: 'schedule' as const },
    { id: 'pdf', label: 'PDFs', icon: 'picture-as-pdf' as const },
    { id: 'receipt', label: 'Receipts', icon: 'receipt' as const },
    { id: 'id', label: 'IDs', icon: 'badge' as const },
  ];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || 
      selectedFilter === 'recent' ||
      doc.type === selectedFilter;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (selectedFilter === 'recent') {
      return b.date.getTime() - a.date.getTime();
    }
    return 0;
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const DocumentCard = ({ doc }: { doc: Document }) => {
    const typeInfo = DOCUMENT_TYPES[doc.type] || DOCUMENT_TYPES.doc;
    
    return (
      <TouchableOpacity
        style={viewMode === 'grid' ? styles.documentCardGrid : styles.documentCardList}
        activeOpacity={0.8}
        onPress={() => onDocumentPress?.(doc)}
      >
        {viewMode === 'grid' ? (
          <>
            {/* Thumbnail/Preview */}
            <View style={[styles.thumbnailGrid, { backgroundColor: typeInfo.bg }]}>
              <MaterialIcons name={typeInfo.icon} size={36} color={typeInfo.color} />
              {doc.pages > 1 && (
                <View style={styles.pagesBadge}>
                  <Text style={styles.pagesText}>{doc.pages}</Text>
                </View>
              )}
            </View>
            {/* Info */}
            <View style={styles.cardInfoGrid}>
              <Text style={styles.docNameGrid} numberOfLines={2}>{doc.name}</Text>
              <Text style={styles.docMeta}>{formatDate(doc.date)} • {doc.size}</Text>
            </View>
          </>
        ) : (
          <>
            {/* Thumbnail */}
            <View style={[styles.thumbnailList, { backgroundColor: typeInfo.bg }]}>
              <MaterialIcons name={typeInfo.icon} size={24} color={typeInfo.color} />
            </View>
            {/* Info */}
            <View style={styles.cardInfoList}>
              <Text style={styles.docNameList} numberOfLines={1}>{doc.name}</Text>
              <View style={styles.docMetaRow}>
                <Text style={styles.docMeta}>{formatDate(doc.date)}</Text>
                <View style={styles.metaDot} />
                <Text style={styles.docMeta}>{doc.pages} {doc.pages === 1 ? 'page' : 'pages'}</Text>
                <View style={styles.metaDot} />
                <Text style={styles.docMeta}>{doc.size}</Text>
              </View>
            </View>
            {/* Actions */}
            <TouchableOpacity style={styles.moreButton}>
              <MaterialIcons name="more-vert" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </>
        )}
      </TouchableOpacity>
    );
  };

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Animated Header Background */}
      <Animated.View style={[styles.headerBg, { opacity: headerOpacity, paddingTop: insets.top }]} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Library</Text>
        <TouchableOpacity 
          style={styles.viewModeButton}
          onPress={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
        >
          <MaterialIcons 
            name={viewMode === 'grid' ? 'view-list' : 'grid-view'} 
            size={22} 
            color={COLORS.black} 
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchSection, { paddingTop: 8 }]}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <MaterialIcons 
                name={filter.icon} 
                size={16} 
                color={selectedFilter === filter.id ? COLORS.white : COLORS.textSecondary} 
              />
              <Text style={[
                styles.filterLabel,
                selectedFilter === filter.id && styles.filterLabelActive,
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Documents Count */}
      <View style={styles.countSection}>
        <Text style={styles.countText}>
          {filteredDocs.length} {filteredDocs.length === 1 ? 'document' : 'documents'}
        </Text>
      </View>

      {/* Documents List/Grid */}
      <Animated.ScrollView
        style={styles.documentsContainer}
        contentContainerStyle={[
          styles.documentsContent,
          { paddingBottom: insets.bottom + 100 },
          viewMode === 'grid' && styles.documentsGrid,
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.black}
          />
        }
      >
        {filteredDocs.length > 0 ? (
          filteredDocs.map(doc => <DocumentCard key={doc.id} doc={doc} />)
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="folder-open" size={48} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No documents found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try a different search term' : 'Scan your first document to get started'}
            </Text>
          </View>
        )}
      </Animated.ScrollView>

      {/* FAB - New Scan */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        activeOpacity={0.9}
      >
        <MaterialIcons name="document-scanner" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
  viewModeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    zIndex: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  filtersSection: {
    marginTop: 16,
    zIndex: 2,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  filterChipActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterLabelActive: {
    color: COLORS.white,
  },
  countSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  countText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  documentsContainer: {
    flex: 1,
  },
  documentsContent: {
    paddingHorizontal: 20,
  },
  documentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  // Grid Card
  documentCardGrid: {
    width: (width - 40 - 16) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  thumbnailGrid: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pagesBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pagesText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  cardInfoGrid: {
    padding: 14,
    gap: 6,
  },
  docNameGrid: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    lineHeight: 18,
  },
  // List Card
  documentCardList: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 14,
  },
  thumbnailList: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfoList: {
    flex: 1,
    gap: 4,
  },
  docNameList: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.black,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docMeta: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textMuted,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: 6,
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
});

export default LibraryScreen;
