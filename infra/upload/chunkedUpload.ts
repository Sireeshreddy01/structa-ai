/**
 * Phase 4: Chunked Upload Manager
 * Handles large file uploads with chunking, retry, and resume
 */

import { File } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig } from '../../config/app.config';
import { checkNetworkConnection } from '../network';

export interface ChunkUploadTask {
  id: string;
  documentId: string;
  fileUri: string;
  fileName: string;
  fileSize: number;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: number[];
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
  retryCount: number;
}

export interface UploadProgress {
  taskId: string;
  progress: number;
  uploadedBytes: number;
  totalBytes: number;
  chunksCompleted: number;
  totalChunks: number;
}

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
const MAX_RETRIES = 3;
const STORAGE_KEY = '@structa/chunk_uploads';

type ProgressCallback = (progress: UploadProgress) => void;

class ChunkedUploadManager {
  private tasks: Map<string, ChunkUploadTask> = new Map();
  private progressCallbacks: Map<string, ProgressCallback[]> = new Map();
  private isProcessing = false;

  async initialize(): Promise<void> {
    await this.loadTasks();
    this.resumePendingUploads();
  }

  private async loadTasks(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const tasks: ChunkUploadTask[] = JSON.parse(stored);
        tasks.forEach((task) => this.tasks.set(task.id, task));
      }
    } catch (error) {
      console.error('Failed to load upload tasks:', error);
    }
  }

  private async saveTasks(): Promise<void> {
    try {
      const tasks = Array.from(this.tasks.values());
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save upload tasks:', error);
    }
  }

  async createUpload(
    documentId: string,
    fileUri: string,
    fileName: string
  ): Promise<string> {
    const file = new File(fileUri);
    const fileInfo = await file.info();
    const fileSize = fileInfo.size ?? 0;
    const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);

    const task: ChunkUploadTask = {
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      documentId,
      fileUri,
      fileName,
      fileSize,
      chunkSize: CHUNK_SIZE,
      totalChunks,
      uploadedChunks: [],
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      retryCount: 0,
    };

    this.tasks.set(task.id, task);
    await this.saveTasks();
    this.processQueue();

    return task.id;
  }

  onProgress(taskId: string, callback: ProgressCallback): () => void {
    const callbacks = this.progressCallbacks.get(taskId) ?? [];
    callbacks.push(callback);
    this.progressCallbacks.set(taskId, callbacks);

    return () => {
      const cbs = this.progressCallbacks.get(taskId) ?? [];
      this.progressCallbacks.set(
        taskId,
        cbs.filter((cb) => cb !== callback)
      );
    };
  }

  private notifyProgress(task: ChunkUploadTask): void {
    const callbacks = this.progressCallbacks.get(task.id) ?? [];
    const progress: UploadProgress = {
      taskId: task.id,
      progress: task.progress,
      uploadedBytes: task.uploadedChunks.length * task.chunkSize,
      totalBytes: task.fileSize,
      chunksCompleted: task.uploadedChunks.length,
      totalChunks: task.totalChunks,
    };
    callbacks.forEach((cb) => cb(progress));
  }

  async pauseUpload(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'uploading') {
      task.status = 'paused';
      task.updatedAt = new Date().toISOString();
      await this.saveTasks();
    }
  }

  async resumeUpload(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'paused') {
      task.status = 'pending';
      task.updatedAt = new Date().toISOString();
      await this.saveTasks();
      this.processQueue();
    }
  }

  async cancelUpload(taskId: string): Promise<void> {
    this.tasks.delete(taskId);
    this.progressCallbacks.delete(taskId);
    await this.saveTasks();
  }

  getTask(taskId: string): ChunkUploadTask | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): ChunkUploadTask[] {
    return Array.from(this.tasks.values());
  }

  private async resumePendingUploads(): Promise<void> {
    const pending = Array.from(this.tasks.values()).filter(
      (t) => t.status === 'pending' || t.status === 'uploading'
    );

    if (pending.length > 0) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;

    const isOnline = await checkNetworkConnection();
    if (!isOnline) return;

    this.isProcessing = true;

    try {
      const pendingTasks = Array.from(this.tasks.values()).filter(
        (t) => t.status === 'pending'
      );

      for (const task of pendingTasks) {
        await this.processTask(task);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processTask(task: ChunkUploadTask): Promise<void> {
    task.status = 'uploading';
    task.updatedAt = new Date().toISOString();
    await this.saveTasks();

    try {
      const file = new File(task.fileUri);
      const content = await file.text();
      const bytes = new TextEncoder().encode(content);

      for (let i = 0; i < task.totalChunks; i++) {
        if (task.uploadedChunks.includes(i)) continue;
        if (task.status === 'paused') break;

        const start = i * task.chunkSize;
        const end = Math.min(start + task.chunkSize, task.fileSize);
        const chunk = bytes.slice(start, end);

        const success = await this.uploadChunk(task, i, chunk);

        if (success) {
          task.uploadedChunks.push(i);
          task.progress = (task.uploadedChunks.length / task.totalChunks) * 100;
          task.updatedAt = new Date().toISOString();
          this.notifyProgress(task);
          await this.saveTasks();
        } else {
          throw new Error(`Failed to upload chunk ${i}`);
        }
      }

      if (task.uploadedChunks.length === task.totalChunks) {
        task.status = 'completed';
        task.progress = 100;
      }
    } catch (error) {
      task.retryCount++;
      task.error = error instanceof Error ? error.message : 'Unknown error';

      if (task.retryCount >= MAX_RETRIES) {
        task.status = 'failed';
      } else {
        task.status = 'pending';
      }
    }

    task.updatedAt = new Date().toISOString();
    await this.saveTasks();
  }

  private async uploadChunk(
    task: ChunkUploadTask,
    chunkIndex: number,
    chunk: Uint8Array
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${AppConfig.api.baseUrl}/api/uploads/${task.documentId}/chunks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'X-Chunk-Index': String(chunkIndex),
            'X-Total-Chunks': String(task.totalChunks),
            'X-File-Name': task.fileName,
          },
          body: chunk,
        }
      );

      return response.ok;
    } catch (error) {
      console.error(`Chunk upload failed:`, error);
      return false;
    }
  }

  async clearCompleted(): Promise<void> {
    const completed = Array.from(this.tasks.values()).filter(
      (t) => t.status === 'completed'
    );

    for (const task of completed) {
      this.tasks.delete(task.id);
    }

    await this.saveTasks();
  }
}

export const chunkedUploadManager = new ChunkedUploadManager();
