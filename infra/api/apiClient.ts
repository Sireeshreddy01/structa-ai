import { config } from './config';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://api.structa.ai/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface AuthTokens {
  token: string;
  expiresAt: string;
}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }
    
    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Auth API
export const authApi = {
  async register(email: string, password: string, name?: string): Promise<ApiResponse<AuthTokens>> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },
  
  async login(email: string, password: string): Promise<ApiResponse<AuthTokens>> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  async logout(): Promise<ApiResponse<void>> {
    return request('/auth/logout', { method: 'POST' });
  },
  
  async getProfile(): Promise<ApiResponse<{ id: string; email: string; name: string }>> {
    return request('/auth/profile');
  },
};

// Documents API
export interface Document {
  id: string;
  title: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  pageCount: number;
  createdAt: string;
}

export interface DocumentDetail extends Document {
  pages: Array<{
    id: string;
    pageNumber: number;
    imageUrl: string;
    status: string;
  }>;
  result?: any;
}

export const documentsApi = {
  async list(): Promise<ApiResponse<Document[]>> {
    return request('/documents');
  },
  
  async get(id: string): Promise<ApiResponse<DocumentDetail>> {
    return request(`/documents/${id}`);
  },
  
  async create(title: string): Promise<ApiResponse<Document>> {
    return request('/documents', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },
  
  async delete(id: string): Promise<ApiResponse<void>> {
    return request(`/documents/${id}`, { method: 'DELETE' });
  },
  
  async getStatus(id: string): Promise<ApiResponse<{ status: string; progress?: number }>> {
    return request(`/documents/${id}/status`);
  },
  
  async process(id: string): Promise<ApiResponse<{ jobId: string }>> {
    return request(`/documents/${id}/process`, { method: 'POST' });
  },
};

// Upload API
export const uploadApi = {
  async uploadPage(
    documentId: string,
    imageUri: string,
    pageNumber: number,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ pageId: string; imageUrl: string }>> {
    const formData = new FormData();
    
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);
    
    formData.append('pageNumber', String(pageNumber));
    
    try {
      const response = await fetch(`${API_BASE_URL}/uploads/${documentId}/pages`, {
        method: 'POST',
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error };
      }
      
      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
    }
  },
  
  async deletePage(documentId: string, pageId: string): Promise<ApiResponse<void>> {
    return request(`/uploads/${documentId}/pages/${pageId}`, { method: 'DELETE' });
  },
  
  async reorderPages(documentId: string, pageOrder: string[]): Promise<ApiResponse<void>> {
    return request(`/uploads/${documentId}/pages/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ pageOrder }),
    });
  },
};

// Health check
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
