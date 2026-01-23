/**
 * Document Scan Workflow
 * Manages the state machine for document scanning
 */

import { apiClient } from '../../infra/api';
import { preprocessImage } from '../../infra/image';
import { uploadManager } from '../../infra/upload';
import { addDocument, updateDocument } from '../../infra/storage';
import type { Document, DocumentSummary } from '../models';
import { AppConfig } from '../../config/app.config';

export type ScanState =
  | 'idle'
  | 'capturing'
  | 'processing'
  | 'uploading'
  | 'waiting'
  | 'completed'
  | 'error';

export interface ScanWorkflowState {
  state: ScanState;
  documentId?: string;
  pages: string[];
  error?: string;
  progress?: number;
}

export class ScanWorkflow {
  private state: ScanWorkflowState = {
    state: 'idle',
    pages: [],
  };

  private listeners: Set<(state: ScanWorkflowState) => void> = new Set();

  getState(): ScanWorkflowState {
    return { ...this.state };
  }

  subscribe(listener: (state: ScanWorkflowState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(l => l(this.getState()));
  }

  private setState(updates: Partial<ScanWorkflowState>): void {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  async startNewScan(): Promise<void> {
    this.setState({ state: 'capturing', pages: [], error: undefined });

    try {
      const { id } = await apiClient.createDocument();
      this.setState({ documentId: id });

      // Add to local storage
      const summary: DocumentSummary = {
        id,
        status: 'pending',
        pageCount: 0,
        createdAt: new Date().toISOString(),
      };
      await addDocument(summary);
    } catch (error) {
      this.setState({
        state: 'error',
        error: error instanceof Error ? error.message : 'Failed to start scan',
      });
    }
  }

  async addPage(imageUri: string): Promise<void> {
    if (!this.state.documentId) {
      throw new Error('No active scan');
    }

    this.setState({ state: 'processing' });

    try {
      // Preprocess image
      const processed = await preprocessImage(imageUri);

      // Add to upload queue
      this.setState({ state: 'uploading' });
      await uploadManager.addToQueue(this.state.documentId, processed.uri);

      // Update pages
      this.setState({
        state: 'capturing',
        pages: [...this.state.pages, processed.uri],
      });

      // Update local storage
      await updateDocument(this.state.documentId, {
        pageCount: this.state.pages.length,
      });
    } catch (error) {
      this.setState({
        state: 'error',
        error: error instanceof Error ? error.message : 'Failed to add page',
      });
    }
  }

  async finishScan(): Promise<Document | null> {
    if (!this.state.documentId || this.state.pages.length === 0) {
      this.setState({ state: 'error', error: 'No pages captured' });
      return null;
    }

    this.setState({ state: 'waiting', progress: 0 });

    try {
      // Poll for completion
      let attempts = 0;
      while (attempts < AppConfig.polling.maxAttempts) {
        const { status, progress } = await apiClient.getProcessingStatus(
          this.state.documentId
        );

        this.setState({ progress });

        if (status === 'completed') {
          const document = await apiClient.getDocument(this.state.documentId);
          await updateDocument(this.state.documentId, { status: 'completed' });
          this.setState({ state: 'completed' });
          return document;
        }

        if (status === 'failed') {
          throw new Error('Processing failed');
        }

        await new Promise(r => setTimeout(r, AppConfig.polling.interval));
        attempts++;
      }

      throw new Error('Processing timeout');
    } catch (error) {
      this.setState({
        state: 'error',
        error: error instanceof Error ? error.message : 'Processing failed',
      });
      await updateDocument(this.state.documentId, { status: 'failed' });
      return null;
    }
  }

  reset(): void {
    this.state = { state: 'idle', pages: [] };
    this.notify();
  }
}

export const scanWorkflow = new ScanWorkflow();
