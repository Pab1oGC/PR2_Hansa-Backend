import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { _id: string };
    }
  }
}
import jwt from 'jsonwebtoken';

interface DecodedToken {
  _id: string;
  email: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) res.status(401).json({ message: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as DecodedToken;
    req.user = { _id: decoded._id }; // puedes añadir más si quieres
    next();
  } catch (error) {
   res.status(401).json({ message: 'Token inválido' });
  }
};
