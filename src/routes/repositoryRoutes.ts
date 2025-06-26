// routes/repositoryRoutes.ts

import express from 'express';
import { getPersonalRepository, getFilesByRepository } from '../controllers/repositoryController';
import { verifyToken } from '../middleware/auth';
import { createRepository, getMyRepositories } from '../controllers/repositoryController';

const router = express.Router();
router.get('/repositorio/:id', verifyToken, getFilesByRepository);
router.get('/personal', verifyToken, getPersonalRepository);
router.post('/', verifyToken, createRepository);
router.get('/mis-repositorios', verifyToken, getMyRepositories);

export default router;
