import { config } from '../../config/index.js';
import { logger } from '../../config/logger.js';

export interface StorageService {
  uploadFile(buffer: Buffer, path: string, mimeType: string): Promise<string>;
  getFileUrl(path: string): Promise<string>;
  deleteFile(path: string): Promise<void>;
  fileExists(path: string): Promise<boolean>;
}

class LocalStorageService implements StorageService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `http://localhost:${config.port}/uploads`;
  }

  async uploadFile(buffer: Buffer, path: string, _mimeType: string): Promise<string> {
    // In production, implement actual file storage
    // For now, return a mock URL
    logger.debug(`Uploading file to ${path}`);
    return `${this.baseUrl}/${path}`;
  }

  async getFileUrl(path: string): Promise<string> {
    return `${this.baseUrl}/${path}`;
  }

  async deleteFile(path: string): Promise<void> {
    logger.debug(`Deleting file at ${path}`);
  }

  async fileExists(_path: string): Promise<boolean> {
    return false;
  }
}

// S3-compatible storage service
class S3StorageService implements StorageService {
  async uploadFile(buffer: Buffer, path: string, mimeType: string): Promise<string> {
    // Implement S3 upload using @aws-sdk/client-s3
    const endpoint = config.storage.endpoint;
    const bucket = config.storage.bucket;
    
    logger.debug(`Uploading to S3: ${bucket}/${path}`);
    
    // Mock implementation
    return `${endpoint}/${bucket}/${path}`;
  }

  async getFileUrl(path: string): Promise<string> {
    return `${config.storage.endpoint}/${config.storage.bucket}/${path}`;
  }

  async deleteFile(path: string): Promise<void> {
    logger.debug(`Deleting from S3: ${path}`);
  }

  async fileExists(_path: string): Promise<boolean> {
    return false;
  }
}

// Export appropriate service based on config
export const storageService: StorageService = config.storage.endpoint
  ? new S3StorageService()
  : new LocalStorageService();
