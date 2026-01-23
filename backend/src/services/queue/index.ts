import { Queue, Worker, Job } from 'bullmq';
import { config } from '../../config/index.js';
import { logger } from '../../config/logger.js';
import { prisma } from '../../config/database.js';

export interface JobPayload {
  documentId: string;
  type: 'PREPROCESS' | 'OCR' | 'LAYOUT_DETECTION' | 'TABLE_EXTRACTION' | 'STRUCTURING' | 'EXPORT';
  payload?: Record<string, any>;
  priority?: number;
}

// Queue is optional - only initialize if Redis is configured
let jobQueue: Queue | null = null;
let jobWorker: Worker | null = null;

function initializeQueue() {
  if (!config.redis.enabled || !config.redis.url) {
    logger.info('Redis not configured - queue disabled');
    return;
  }

  try {
    const connection = {
      host: new URL(config.redis.url).hostname,
      port: parseInt(new URL(config.redis.url).port || '6379'),
    };

    jobQueue = new Queue('structa-jobs', { connection });

    // Job processor
    jobWorker = new Worker(
      'structa-jobs',
      async (job: Job<JobPayload>) => {
        const { documentId, type, payload } = job.data;

        logger.info(`Processing job ${type} for document ${documentId}`);

        // Update job status in database
        const dbJob = await prisma.job.findFirst({
          where: {
            documentId,
            type,
            status: 'PENDING',
          },
        });

        if (dbJob) {
          await prisma.job.update({
            where: { id: dbJob.id },
            data: {
              status: 'PROCESSING',
              startedAt: new Date(),
            },
          });
        }

        try {
          // Process based on job type
          let result: any;

          switch (type) {
            case 'PREPROCESS':
              result = await processPreprocess(documentId, payload);
              break;
            case 'OCR':
              result = await processOCR(documentId, payload);
              break;
            case 'LAYOUT_DETECTION':
              result = await processLayoutDetection(documentId, payload);
              break;
            case 'TABLE_EXTRACTION':
              result = await processTableExtraction(documentId, payload);
              break;
            case 'STRUCTURING':
              result = await processStructuring(documentId, payload);
              break;
            case 'EXPORT':
              result = await processExport(documentId, payload);
              break;
          }

          // Update job as completed
          if (dbJob) {
            await prisma.job.update({
              where: { id: dbJob.id },
              data: {
                status: 'COMPLETED',
                result,
                completedAt: new Date(),
              },
            });
          }

          // Queue next job in pipeline if applicable
          await queueNextJob(documentId, type);

          return result;
        } catch (error) {
          if (dbJob) {
            await prisma.job.update({
              where: { id: dbJob.id },
              data: {
                status: 'FAILED',
                error: error instanceof Error ? error.message : 'Unknown error',
                attempts: { increment: 1 },
              },
            });
          }
          throw error;
        }
      },
      {
        connection,
        concurrency: 5,
      }
    );

    logger.info('Queue initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize queue', { error });
  }
}

// Job processing functions
async function processPreprocess(documentId: string, _payload: any): Promise<any> {
  logger.info(`Preprocessing document ${documentId}`);
  return { status: 'preprocessed' };
}

async function processOCR(documentId: string, _payload: any): Promise<any> {
  logger.info(`Running OCR for document ${documentId}`);
  return { status: 'ocr_completed' };
}

async function processLayoutDetection(documentId: string, _payload: any): Promise<any> {
  logger.info(`Detecting layout for document ${documentId}`);
  return { status: 'layout_detected' };
}

async function processTableExtraction(documentId: string, _payload: any): Promise<any> {
  logger.info(`Extracting tables for document ${documentId}`);
  return { status: 'tables_extracted' };
}

async function processStructuring(documentId: string, _payload: any): Promise<any> {
  logger.info(`Structuring data for document ${documentId}`);
  return { status: 'structured' };
}

async function processExport(documentId: string, _payload: any): Promise<any> {
  logger.info(`Exporting document ${documentId}`);
  return { status: 'exported' };
}

// Queue next job in the processing pipeline
async function queueNextJob(documentId: string, completedType: string): Promise<void> {
  const pipeline = [
    'PREPROCESS',
    'OCR',
    'LAYOUT_DETECTION',
    'TABLE_EXTRACTION',
    'STRUCTURING',
  ];

  const currentIndex = pipeline.indexOf(completedType);

  if (currentIndex >= 0 && currentIndex < pipeline.length - 1) {
    const nextType = pipeline[currentIndex + 1] as JobPayload['type'];
    await addJob({ documentId, type: nextType });
  } else if (completedType === 'STRUCTURING') {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'COMPLETED' },
    });
  }
}

// Add job to queue (or just save to DB if no queue)
async function addJob(jobData: JobPayload): Promise<string> {
  const dbJob = await prisma.job.create({
    data: {
      documentId: jobData.documentId,
      type: jobData.type,
      payload: jobData.payload,
      priority: jobData.priority ?? 0,
    },
  });

  if (jobQueue) {
    const job = await jobQueue.add(jobData.type, jobData, {
      priority: jobData.priority ?? 0,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
    return job.id ?? dbJob.id;
  }

  logger.info('Queue not available, job saved to database', { jobId: dbJob.id });
  return dbJob.id;
}

function isQueueEnabled(): boolean {
  return jobQueue !== null;
}

// Initialize on import
initializeQueue();

export { jobQueue, jobWorker, addJob, isQueueEnabled };

export default {
  addJob,
  isQueueEnabled,
  queue: jobQueue,
  worker: jobWorker,
};
