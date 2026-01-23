/**
 * Export Service - handles document exports
 */

import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { Document, Block } from '../models';

export type ExportFormat = 'text' | 'json' | 'csv';

export interface ExportResult {
  success: boolean;
  uri?: string;
  error?: string;
}

/**
 * Export document blocks to text format
 */
function blocksToText(blocks: Block[]): string {
  return blocks
    .map(block => {
      if (block.type === 'text' || block.type === 'number') {
        return String(block.content);
      }
      if (block.type === 'table' && Array.isArray(block.content)) {
        return (block.content as string[][])
          .map(row => row.join('\t'))
          .join('\n');
      }
      return '';
    })
    .join('\n\n');
}

/**
 * Export document blocks to CSV format
 */
function blocksToCSV(blocks: Block[]): string {
  const tableBlocks = blocks.filter(b => b.type === 'table');
  if (tableBlocks.length === 0) {
    // Fallback to text content as single column
    return blocks
      .filter(b => b.type === 'text')
      .map(b => `"${String(b.content).replace(/"/g, '""')}"`)
      .join('\n');
  }

  // Export first table
  const table = tableBlocks[0].content as string[][];
  return table
    .map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');
}

/**
 * Export document to specified format
 */
export async function exportDocument(
  document: Document,
  format: ExportFormat
): Promise<ExportResult> {
  try {
    let content: string;
    let extension: string;

    switch (format) {
      case 'text':
        content = blocksToText(document.blocks);
        extension = 'txt';
        break;
      case 'csv':
        content = blocksToCSV(document.blocks);
        extension = 'csv';
        break;
      case 'json':
        content = JSON.stringify(document.blocks, null, 2);
        extension = 'json';
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    const filename = `structa_${document.id}_${Date.now()}.${extension}`;
    const file = new File(Paths.document, filename);
    await file.write(content);

    return { success: true, uri: file.uri };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
    };
  }
}

/**
 * Share exported file
 */
export async function shareExport(uri: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Sharing is not available on this device');
  }
  await Sharing.shareAsync(uri);
}
