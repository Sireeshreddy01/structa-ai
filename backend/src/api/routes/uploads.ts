import { Router } from 'express';
import multer from 'multer';
import { authMiddleware, uploadRateLimiter } from '../middlewares/index.js';
import { uploadPage, deletePage, reorderPages } from '../controllers/uploadController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and HEIC are allowed.'));
    }
  },
});

const router = Router();

// All routes require authentication
router.use(authMiddleware);
router.use(uploadRateLimiter);

router.post('/:documentId/pages', upload.single('image'), uploadPage);
router.delete('/:documentId/pages/:pageId', deletePage);
router.put('/:documentId/pages/reorder', reorderPages);

export const uploadRoutes = router;
