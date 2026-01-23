import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware, validate } from '../middlewares/index.js';
import {
  createDocument,
  listDocuments,
  getDocument,
  getDocumentStatus,
  deleteDocument,
  processDocument,
  createDocumentSchema,
} from '../controllers/documentController.js';

const router = Router();

// Wrap async handlers to catch errors
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// All routes require authentication
router.use(authMiddleware);

router.post('/', validate(createDocumentSchema), asyncHandler(createDocument));
router.get('/', asyncHandler(listDocuments));
router.get('/:id', asyncHandler(getDocument));
router.get('/:id/status', asyncHandler(getDocumentStatus));
router.delete('/:id', asyncHandler(deleteDocument));
router.post('/:id/process', asyncHandler(processDocument));

export const documentRoutes = router;
