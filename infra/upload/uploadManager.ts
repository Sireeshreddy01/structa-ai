/**
 * Upload Manager - handles background uploads with retry
 */

import {
  uploadAsync,
  FileSystemUploadType,
} from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig } from '../../config/app.config';

export interface UploadTask {
  id: string;
  documentId: string;
  imageUri: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  retryCount: number;
  createdAt: string;
  error?: string;
}

class UploadManager {
  private queue: UploadTask[] = [];
  private isProcessing = false;

  async initialize(): Promise<void> {
    await this.loadQueue();
    this.processQueue();
  }

  private async loadQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(AppConfig.storage.uploadQueueKey);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load upload queue:', error);
      this.queue = [];
    }
  }

  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        AppConfig.storage.uploadQueueKey,
        JSON.stringify(this.queue)
      );
    } catch (error) {
      console.error('Failed to save upload queue:', error);
    }
  }

  async addToQueue(documentId: string, imageUri: string): Promise<string> {
    const task: UploadTask = {
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      documentId,
      imageUri,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.queue.push(task);
    await this.saveQueue();
    this.processQueue();

    return task.id;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const pendingTasks = this.queue.filter(t => t.status === 'pending');

      for (const task of pendingTasks) {
        await this.processTask(task);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processTask(task: UploadTask): Promise<void> {
    task.status = 'uploading';
    await this.saveQueue();

    try {
      const uploadResult = await uploadAsync(
        `${AppConfig.api.baseUrl}/api/documents/${task.documentId}/pages`,
        task.imageUri,
        {
          fieldName: 'image',
          httpMethod: 'POST',
          uploadType: FileSystemUploadType.MULTIPART,
        }
      );

      if (uploadResult.status >= 200 && uploadResult.status < 300) {
        task.status = 'completed';
      } else {
        throw new Error(`Upload failed with status ${uploadResult.status}`);
      }
    } catch (error) {
      task.retryCount++;
      task.error = error instanceof Error ? error.message : 'Unknown error';
      task.status = task.retryCount >= 3 ? 'failed' : 'pending';
    }

    await this.saveQueue();
  }

  getQueue(): UploadTask[] {
    return [...this.queue];
  }

  async clearCompleted(): Promise<void> {
    this.queue = this.queue.filter(t => t.status !== 'completed');
    await this.saveQueue();
  }
}

export const uploadManager = new UploadManager();
