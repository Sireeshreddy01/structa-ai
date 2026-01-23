/**
 * Offline Queue Manager
 * Queues operations when offline and syncs when online
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { checkNetworkConnection } from '../network';

export type QueuedOperationType = 
  | 'upload'
  | 'create_document'
  | 'update_document'
  | 'delete_document';

export interface QueuedOperation {
  id: string;
  type: QueuedOperationType;
  payload: Record<string, any>;
  createdAt: string;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'failed';
  error?: string;
}

const QUEUE_STORAGE_KEY = '@structa/offline_queue';
const MAX_QUEUE_SIZE = 100;

class OfflineQueueManager {
  private queue: QueuedOperation[] = [];
  private isProcessing = false;
  private unsubscribeNetInfo: (() => void) | null = null;

  async initialize(): Promise<void> {
    await this.loadQueue();
    this.setupNetworkListener();
  }

  private async loadQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private setupNetworkListener(): void {
    this.unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        this.processQueue();
      }
    });
  }

  async enqueue(
    type: QueuedOperationType,
    payload: Record<string, any>,
    maxRetries: number = 3
  ): Promise<string> {
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      // Remove oldest completed/failed items
      this.queue = this.queue.filter((op) => op.status === 'pending');
      
      if (this.queue.length >= MAX_QUEUE_SIZE) {
        throw new Error('Offline queue is full');
      }
    }

    const operation: QueuedOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries,
      status: 'pending',
    };

    this.queue.push(operation);
    await this.saveQueue();

    // Try to process immediately if online
    this.processQueue();

    return operation.id;
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing) return;

    const isOnline = await checkNetworkConnection();
    if (!isOnline) return;

    this.isProcessing = true;

    try {
      const pendingOps = this.queue.filter((op) => op.status === 'pending');

      for (const operation of pendingOps) {
        await this.processOperation(operation);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processOperation(operation: QueuedOperation): Promise<void> {
    operation.status = 'processing';
    await this.saveQueue();

    try {
      switch (operation.type) {
        case 'upload':
          await this.handleUploadOperation(operation);
          break;
        case 'create_document':
          await this.handleCreateDocumentOperation(operation);
          break;
        case 'update_document':
          await this.handleUpdateDocumentOperation(operation);
          break;
        case 'delete_document':
          await this.handleDeleteDocumentOperation(operation);
          break;
      }

      // Success - remove from queue
      this.queue = this.queue.filter((op) => op.id !== operation.id);
    } catch (error) {
      operation.retryCount++;
      operation.error = error instanceof Error ? error.message : 'Unknown error';

      if (operation.retryCount >= operation.maxRetries) {
        operation.status = 'failed';
      } else {
        operation.status = 'pending';
      }
    }

    await this.saveQueue();
  }

  private async handleUploadOperation(operation: QueuedOperation): Promise<void> {
    const { documentId, fileUri, fileName } = operation.payload;
    // Delegate to upload manager
    console.log(`Processing upload for document ${documentId}`);
  }

  private async handleCreateDocumentOperation(operation: QueuedOperation): Promise<void> {
    const { localId, title } = operation.payload;
    console.log(`Creating document ${localId}`);
  }

  private async handleUpdateDocumentOperation(operation: QueuedOperation): Promise<void> {
    const { documentId, updates } = operation.payload;
    console.log(`Updating document ${documentId}`);
  }

  private async handleDeleteDocumentOperation(operation: QueuedOperation): Promise<void> {
    const { documentId } = operation.payload;
    console.log(`Deleting document ${documentId}`);
  }

  getQueue(): QueuedOperation[] {
    return [...this.queue];
  }

  getPendingCount(): number {
    return this.queue.filter((op) => op.status === 'pending').length;
  }

  getFailedCount(): number {
    return this.queue.filter((op) => op.status === 'failed').length;
  }

  async retryFailed(): Promise<void> {
    const failedOps = this.queue.filter((op) => op.status === 'failed');
    for (const op of failedOps) {
      op.status = 'pending';
      op.retryCount = 0;
      op.error = undefined;
    }
    await this.saveQueue();
    this.processQueue();
  }

  async clearFailed(): Promise<void> {
    this.queue = this.queue.filter((op) => op.status !== 'failed');
    await this.saveQueue();
  }

  async clearAll(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
  }

  destroy(): void {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
    }
  }
}

export const offlineQueue = new OfflineQueueManager();
