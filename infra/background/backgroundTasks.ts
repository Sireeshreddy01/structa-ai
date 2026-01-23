/**
 * Background Task Manager
 * Handles background uploads and processing tasks
 */

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig } from '../../config/app.config';

// Task identifiers
export const BACKGROUND_UPLOAD_TASK = 'STRUCTA_BACKGROUND_UPLOAD';
export const BACKGROUND_SYNC_TASK = 'STRUCTA_BACKGROUND_SYNC';

export interface BackgroundTaskStatus {
  isRegistered: boolean;
  status: BackgroundFetch.BackgroundFetchStatus | null;
}

/**
 * Define the background upload task
 */
TaskManager.defineTask(BACKGROUND_UPLOAD_TASK, async () => {
  try {
    // Get pending uploads from storage
    const stored = await AsyncStorage.getItem(AppConfig.storage.uploadQueueKey);
    if (!stored) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const queue = JSON.parse(stored);
    const pendingTasks = queue.filter(
      (t: any) => t.status === 'pending' || t.status === 'failed'
    );

    if (pendingTasks.length === 0) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Process pending uploads (simplified - actual upload logic in uploadManager)
    console.log(`[Background] Processing ${pendingTasks.length} pending uploads`);

    // Mark that we have new data to process
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('[Background] Upload task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Define the background sync task
 */
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    // Check for documents that need status updates
    const stored = await AsyncStorage.getItem(AppConfig.storage.documentsKey);
    if (!stored) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const documents = JSON.parse(stored);
    const processingDocs = documents.filter((d: any) => d.status === 'processing');

    if (processingDocs.length === 0) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    console.log(`[Background] Syncing ${processingDocs.length} processing documents`);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('[Background] Sync task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Register background tasks
 */
export async function registerBackgroundTasks(): Promise<void> {
  try {
    // Register upload task
    await BackgroundFetch.registerTaskAsync(BACKGROUND_UPLOAD_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });

    // Register sync task
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 30 * 60, // 30 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log('[Background] Tasks registered successfully');
  } catch (error) {
    console.error('[Background] Failed to register tasks:', error);
  }
}

/**
 * Unregister all background tasks
 */
export async function unregisterBackgroundTasks(): Promise<void> {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_UPLOAD_TASK);
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    console.log('[Background] Tasks unregistered');
  } catch (error) {
    console.error('[Background] Failed to unregister tasks:', error);
  }
}

/**
 * Get background task status
 */
export async function getBackgroundTaskStatus(
  taskName: string
): Promise<BackgroundTaskStatus> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);
    const status = await BackgroundFetch.getStatusAsync();
    return { isRegistered, status };
  } catch (error) {
    console.error('[Background] Failed to get task status:', error);
    return { isRegistered: false, status: null };
  }
}

/**
 * Check if background fetch is available
 */
export async function isBackgroundFetchAvailable(): Promise<boolean> {
  const status = await BackgroundFetch.getStatusAsync();
  return status === BackgroundFetch.BackgroundFetchStatus.Available;
}
