import { Router } from 'express';
import { authRoutes } from './auth.js';
import { documentRoutes } from './documents.js';
import { uploadRoutes } from './uploads.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/uploads', uploadRoutes);

export const apiRoutes = router;
