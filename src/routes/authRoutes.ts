/**
 * src/routes/authRoutes.ts
 */

import { Router } from 'express';
import { login, register, verifyCode, resendCode } from '../controllers/authController';

const router = Router();

// Ruta para el inicio de sesión
router.post('/login', login);

// Ruta para el registro de nuevos usuarios
router.post('/register', register);

router.post('/verify-code', verifyCode);
router.post('/resend-code', resendCode);

export default router;
