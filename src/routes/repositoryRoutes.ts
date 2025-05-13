// routes/repositoryRoutes.ts

import express from 'express';
import { getPersonalRepository } from '../controllers/repositoryController';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.get('/personal', verifyToken, getPersonalRepository);

export default router;
