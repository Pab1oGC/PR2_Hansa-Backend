// src/controllers/repositoryController.ts
import { Request, Response } from 'express';
import Repository from '../models/Repository';

/*export const getPersonalRepository = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id; // asumimos que el middleware de autenticación ya añade `req.user`
    console.log('ID de usuario:', userId); // Verifica que el ID de usuario se está obteniendo correctamente
    const personalRepo = await Repository.findOne({
      linkedToUser: userId,
      type: 'personal',
    });

    if (!personalRepo) {
     res.status(404).json({ message: 'Repositorio personal no encontrado.' });
    }

 res.json(personalRepo);
  } catch (error) {
    console.error('Error al buscar repositorio personal:', error);
 res.status(500).json({ message: 'Error interno del servidor.' });
  }
};*/
export const getPersonalRepository = async (req: Request, res: Response) => {
  try {
    // ID del repositorio fijo para pruebas
    const repositoryId = '6811be7d956e4955d0db2a01';

    const repository = await Repository.findById(repositoryId);

    if (!repository) {
      res.status(404).json({ message: 'Repositorio no encontrado' });
    }

    res.status(200).json(repository);
  } catch (error) {
    console.error('Error al obtener el repositorio:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
