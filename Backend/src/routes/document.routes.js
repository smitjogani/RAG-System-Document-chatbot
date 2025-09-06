import { Router } from 'express';
import multer from 'multer';
import { uploadDocuments } from '../controller/document.controller.js'; 
import { fileURLToPath } from 'url';
import path from 'path';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({ dest: path.join(__dirname, '..', '..', 'tmp') });

router.post('/upload', upload.array('documents', 10), uploadDocuments);

export default router;
