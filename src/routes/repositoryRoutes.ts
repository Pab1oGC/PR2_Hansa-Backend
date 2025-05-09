// src/routes/repositoryRoutes.ts
import express from 'express';
import { getPersonalRepository } from '../controllers/repositoryController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/personal', authenticateToken, getPersonalRepository);

export default router;
