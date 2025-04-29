/**
 * src/controllers/authController.ts
 */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const SALT_ROUNDS = 10; // Número de rondas de sal para bcrypt (mayor es más seguro, pero más lento)

let currentVerificationCode: string = generateCode();
let codeExpiresAt: number = Date.now() + 2 * 60 * 1000; // 2 minutos

function generateCode(): string {
  return Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 10).toString()
  ).join('');
}

/**
 * REGISTER
 * @param req 
 * @param res 
 * @returns 
 */
export const register = async (req: Request, res: Response): Promise<Response> => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // 1. Generar el hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 2. Crear un nuevo usuario con la contraseña hasheada
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error: any) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Could not register user' });
  }
};

/**
 * LOGIN
 * @param req 
 * @param res 
 * @returns 
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ahora 'user.password' debería ser el hash almacenado
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ token });
  } catch (error: any) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Could not log in' });
  }
};

/**
 * AUTH - VERIFY CODE
 * CREATED/UPDATED BY HEREDIA
 * @param req 
 * @param res 
 * @returns 
 */
export const verifyCode = (req: Request, res: Response): Response => {
  const { code } = req.body;

  if (!code || code.length !== 6) {
    return res.status(400).json({ success: false, message: "El código debe tener 6 dígitos." });
  }

  if (Date.now() > codeExpiresAt) {
    return res.status(410).json({ success: false, message: "El código ha expirado. Solicita uno nuevo." });
  }

  if (code !== currentVerificationCode) {
    return res.status(401).json({ success: false, message: "Código inválido." });
  }

  return res.status(200).json({ success: true, message: "✅ Código verificado correctamente." });
  // created/updated by heredia
};

/**
 * AUTH - RESEND CODE
 * CREATED/UPDATED BY HEREDIA
 */
export const resendCode = (req: Request, res: Response): Response => {
  currentVerificationCode = generateCode();
  codeExpiresAt = Date.now() + 2 * 60 * 1000;

  console.log("📩 Nuevo código generado:", currentVerificationCode);

  return res.status(200).json({
    success: true,
    message: "Código reenviado al correo registrado.",
    code: process.env.NODE_ENV !== 'production' ? currentVerificationCode : undefined,
  });
  // created/updated by heredia
};
