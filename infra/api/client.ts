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
      console.log('[API] Request:', this.baseUrl + endpoint);
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers,
      });

      const text = await response.text();
      console.log('[API] Response text:', text.substring(0, 200));
      
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data?.error?.message || data?.message || `API Error: ${response.status}`);
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
    
    const token = result?.data?.token;
    if (!token) {
      throw new Error('Login failed - no token received');
    }
    
    await this.saveToken(token);
    return { token };
  }

  async register(name: string, email: string, password: string): Promise<{ token: string }> {
    const result = await this.request<{ success: boolean; data: { token: string } }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    const token = result?.data?.token;
    if (!token) {
      throw new Error('Registration failed - no token received');
    }
    
    await this.saveToken(token);
    return { token };
  }

  async logout(): Promise<void> {
    await this.clearToken();
  }

  // Document endpoints
  async createDocument(): Promise<{ id: string; uploadUrl: string }> {
    const result = await this.request<{ success: boolean; data: { document: { id: string } } }>('/api/documents', { method: 'POST' });
    return { id: result.data.document.id, uploadUrl: '' };
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      console.log('[API] Uploading image to:', `${this.baseUrl}/api/uploads/${documentId}/pages`);
      console.log('[API] Token present:', !!this.token);
      
      const response = await fetch(`${this.baseUrl}/api/uploads/${documentId}/pages`, {
        method: 'POST',
        signal: controller.signal,
        headers,
        body: formData,
      });

      const text = await response.text();
      console.log('[API] Upload response:', text.substring(0, 200));
      
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data?.error?.message || data?.message || `Upload failed: ${response.status}`);
      }

      return data?.data?.page || data;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Processing status
  async getProcessingStatus(
    documentId: string
  ): Promise<{ status: Document['status']; progress?: number }> {
    return this.request(`/api/documents/${documentId}/status`);
  }
}

export const apiClient = new ApiClient();
