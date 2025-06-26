// controllers/repositoryController.ts

import { Request, Response } from 'express';
import Repository from '../models/Repository';
import User from '../models/User';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export const getPersonalRepository = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user: { id: string } }).user.id;

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
    logger.error('Error al obtener repositorio personal:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear nuevo repositorio
export const createRepository = async (req: Request, res: Response) => {
  try {
    const ownerId = (req as Request & { user: { id: string } }).user.id;
    const { name, description, type, memberEmails } = req.body;

    // Validación básica
    if (!name || !type) {
      res.status(400).json({ message: 'Nombre y tipo son obligatorios' });
      return;
    }

    // Validar que los miembros existan
    const foundUsers = await User.find({ email: { $in: memberEmails || [] } });
    if (foundUsers.length !== (memberEmails || []).length) {
      res.status(400).json({ message: 'Uno o más correos no están registrados' });
      return;
    }
    const memberIds = foundUsers.map((u) => u._id);
    // Agrega al creador directamente
    if (!memberIds.includes(ownerId)) {
      memberIds.push(ownerId);
    }
    logger.log(
      'Usuarios encontrados:',
      foundUsers.map((u) => u.email),
    );

    const newRepo = new Repository({
      name,
      description,
      type,
      owner: ownerId,
      members: memberIds,
    });

    res.status(201).json({ message: 'Repositorio creado con éxito', repository: newRepo });
    await newRepo.save();
  } catch (error) {
    logger.error('Error al crear repositorio:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
export const getMyRepositories = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user: { id: string } }).user.id;

    const repos = await Repository.find({
      $or: [{ owner: userId }, { members: userId }],
    }).sort({ createdAt: -1 });

    res.status(200).json(repos);
  } catch (error) {
    logger.error('Error al obtener repositorios del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
export const getFilesByRepository = async (req: Request, res: Response) => {
  const repositoryId = req.params.id;
  const db = mongoose.connection.db;

  try {
    const files = await db
      .collection('uploads.files')
      .find({ 'metadata.repositoryId': repositoryId })
      .toArray();

    res.status(200).json(files);
  } catch (error) {
    console.error('Error al obtener archivos por repositorio:', error);
    res.status(500).json({ message: 'Error al obtener archivos' });
  }
};
