import { Router } from 'express';
import multer from 'multer';
import { handleStripeWebhook } from './stripe/webhook';
import { handleDocumentUpload } from './retrofit/upload';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

export const retrofitRouter = Router();

retrofitRouter.post('/stripe/webhook', handleStripeWebhook);
retrofitRouter.post('/retrofit/upload-document', upload.single('propertyFile'), handleDocumentUpload);
