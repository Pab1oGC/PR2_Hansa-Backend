import express from 'express';
import multer from 'multer';
import { getUserFiles, uploadFileToPersonalRepo } from '../controllers/fileController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta: POST /api/files/upload-to-personal
router.post('/upload-to-personal', authenticateToken, upload.single('file'), uploadFileToPersonalRepo);
router.get('/personal', authenticateToken, getUserFiles);

export default router;
