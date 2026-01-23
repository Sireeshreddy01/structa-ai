import { Router } from 'express';
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

// All routes require authentication
router.use(authMiddleware);

router.post('/', validate(createDocumentSchema), createDocument);
router.get('/', listDocuments);
router.get('/:id', getDocument);
router.get('/:id/status', getDocumentStatus);
router.delete('/:id', deleteDocument);
router.post('/:id/process', processDocument);

export const documentRoutes = router;
