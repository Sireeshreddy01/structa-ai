/**
 * API Client for Structa AI Backend
 */

import { AppConfig } from '../../config/app.config';
import type { Document, DocumentSummary } from '../../domain/models';

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = AppConfig.api.baseUrl;
    this.timeout = AppConfig.api.timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Document endpoints
  async createDocument(): Promise<{ id: string; uploadUrl: string }> {
    return this.request('/api/documents', { method: 'POST' });
  }

  async getDocument(id: string): Promise<Document> {
    return this.request(`/api/documents/${id}`);
  }

  async listDocuments(): Promise<DocumentSummary[]> {
    return this.request('/api/documents');
  }

  async deleteDocument(id: string): Promise<void> {
    await this.request(`/api/documents/${id}`, { method: 'DELETE' });
  }

  // Upload endpoint
  async uploadImage(
    documentId: string,
    imageUri: string
  ): Promise<{ pageId: string }> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'scan.jpg',
    } as any);

    return this.request(`/api/documents/${documentId}/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  // Processing status
  async getProcessingStatus(
    documentId: string
  ): Promise<{ status: Document['status']; progress?: number }> {
    return this.request(`/api/documents/${documentId}/status`);
  }
}

export const apiClient = new ApiClient();
