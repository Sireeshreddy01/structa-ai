/**
 * Local storage utilities using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DocumentSummary } from '../../domain/models';
import { AppConfig } from '../../config/app.config';

export async function saveDocuments(documents: DocumentSummary[]): Promise<void> {
  await AsyncStorage.setItem(
    AppConfig.storage.documentsKey,
    JSON.stringify(documents)
  );
}

export async function loadDocuments(): Promise<DocumentSummary[]> {
  const stored = await AsyncStorage.getItem(AppConfig.storage.documentsKey);
  return stored ? JSON.parse(stored) : [];
}

export async function addDocument(document: DocumentSummary): Promise<void> {
  const documents = await loadDocuments();
  documents.unshift(document);
  await saveDocuments(documents);
}

export async function removeDocument(id: string): Promise<void> {
  const documents = await loadDocuments();
  const filtered = documents.filter(d => d.id !== id);
  await saveDocuments(filtered);
}

export async function updateDocument(
  id: string,
  updates: Partial<DocumentSummary>
): Promise<void> {
  const documents = await loadDocuments();
  const index = documents.findIndex(d => d.id === id);
  if (index !== -1) {
    documents[index] = { ...documents[index], ...updates };
    await saveDocuments(documents);
  }
}
