// controllers/repositoryController.ts

import { Request, Response } from 'express';
import Repository from '../models/Repository';

export const getPersonalRepository = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const personalRepo = await Repository.findOne({
      linkedToUser: userId,
      type: 'personal',
    });

    if (!personalRepo) {
      res.status(404).json({ message: 'Repositorio personal no encontrado' });
      return;
    }

    res.status(200).json({ personalRepoId: personalRepo._id });
  } catch (error) {
    console.error('Error al obtener repositorio personal:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
