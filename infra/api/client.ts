/**
 * API Client for Structa AI Backend
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig } from '../../config/app.config';
import type { Document, DocumentSummary } from '../../domain/models';

const TOKEN_KEY = 'structa_auth_token';

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private token: string | null = null;

  constructor() {
    this.baseUrl = AppConfig.api.baseUrl;
    this.timeout = AppConfig.api.timeout;
    this.loadToken();
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.error('Failed to load token:', e);
    }
  }

  private async saveToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  async getToken(): Promise<string | null> {
    if (!this.token) {
      await this.loadToken();
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `API Error: ${response.status}`);
      }

      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ token: string }> {
    const result = await this.request<{ success: boolean; data: { token: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await this.saveToken(result.data.token);
    return { token: result.data.token };
  }

  async register(name: string, email: string, password: string): Promise<{ token: string }> {
    const result = await this.request<{ success: boolean; data: { token: string } }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    await this.saveToken(result.data.token);
    return { token: result.data.token };
  }

  async logout(): Promise<void> {
    await this.clearToken();
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
