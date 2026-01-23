/**
 * Multi-page Document Scanner
 * Manages multi-page document capture sessions
 */

import { processForAI, createMultiResolution } from './imageQuality';

export interface PageCapture {
  id: string;
  pageNumber: number;
  originalUri: string;
  processedUri: string;
  thumbnailUri: string;
  width: number;
  height: number;
  capturedAt: string;
}

export interface MultiPageSession {
  id: string;
  pages: PageCapture[];
  createdAt: string;
  updatedAt: string;
  status: 'capturing' | 'processing' | 'ready' | 'error';
}

/**
 * Create a new multi-page scanning session
 */
export function createSession(): MultiPageSession {
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    pages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'capturing',
  };
}

/**
 * Add a page to the scanning session
 */
export async function addPageToSession(
  session: MultiPageSession,
  imageUri: string
): Promise<{ session: MultiPageSession; page: PageCapture }> {
  const pageNumber = session.pages.length + 1;
  const pageId = `page_${pageNumber}_${Date.now()}`;

  // Process image for AI
  const processed = await processForAI(imageUri);
  
  // Create thumbnail
  const resolutions = await createMultiResolution(imageUri);

  const page: PageCapture = {
    id: pageId,
    pageNumber,
    originalUri: imageUri,
    processedUri: processed.uri,
    thumbnailUri: resolutions.thumbnail,
    width: processed.width,
    height: processed.height,
    capturedAt: new Date().toISOString(),
  };

  const updatedSession: MultiPageSession = {
    ...session,
    pages: [...session.pages, page],
    updatedAt: new Date().toISOString(),
  };

  return { session: updatedSession, page };
}

/**
 * Remove a page from the session
 */
export function removePageFromSession(
  session: MultiPageSession,
  pageId: string
): MultiPageSession {
  const filteredPages = session.pages
    .filter((p) => p.id !== pageId)
    .map((p, index) => ({ ...p, pageNumber: index + 1 }));

  return {
    ...session,
    pages: filteredPages,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Reorder pages in the session
 */
export function reorderPages(
  session: MultiPageSession,
  fromIndex: number,
  toIndex: number
): MultiPageSession {
  const pages = [...session.pages];
  const [removed] = pages.splice(fromIndex, 1);
  pages.splice(toIndex, 0, removed);

  const renumberedPages = pages.map((p, index) => ({
    ...p,
    pageNumber: index + 1,
  }));

  return {
    ...session,
    pages: renumberedPages,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Finalize session for upload
 */
export function finalizeSession(
  session: MultiPageSession
): MultiPageSession {
  if (session.pages.length === 0) {
    return { ...session, status: 'error' };
  }
  return {
    ...session,
    status: 'ready',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get session summary
 */
export function getSessionSummary(session: MultiPageSession): {
  pageCount: number;
  firstPageThumbnail: string | null;
  createdAt: string;
  status: string;
} {
  return {
    pageCount: session.pages.length,
    firstPageThumbnail: session.pages[0]?.thumbnailUri ?? null,
    createdAt: session.createdAt,
    status: session.status,
  };
}
