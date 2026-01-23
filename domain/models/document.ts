/**
 * Core data models for Structa AI
 * Shared contracts between mobile and backend
 */

export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type BlockType = 'text' | 'table' | 'number';

export interface Block {
  id: string;
  type: BlockType;
  content: string | string[][];
  confidence: number;
  boundingBox?: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Page {
  id: string;
  imageUri: string;
  uploadedAt?: string;
  processedAt?: string;
}

export interface Document {
  id: string;
  status: DocumentStatus;
  pages: Page[];
  blocks: Block[];
  createdAt: string;
  updatedAt?: string;
  title?: string;
}

export interface DocumentSummary {
  id: string;
  status: DocumentStatus;
  pageCount: number;
  createdAt: string;
  title?: string;
  thumbnailUri?: string;
}
