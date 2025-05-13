import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import File from '../models/File';

let gfsBucket: GridFSBucket;

mongoose.connection.once('open', () => {
  gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads',
  });
});

export const uploadFile: RequestHandler = async (req, res) => {
  try {
    const file = (req as any).file;
    if (!file) {
       res.status(400).json({ message: 'No se subió ningún archivo' });
       return;
    }

    const { title, author, description, tags, repositoryId, importance, privacy } = req.body;

    const metadata: any = {
      title,
      author,
      description,
      tags: tags?.split(',') || [],
      uploadedBy: (req as any).user.id,
      importance,
      privacy,
    };

    if (repositoryId) {
      metadata.repositoryId = new mongoose.Types.ObjectId(repositoryId);
    }

    const uploadStream = gfsBucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
      metadata,
    });

    const gridFsId: ObjectId = uploadStream.id as ObjectId;

    uploadStream.end(file.buffer);

    uploadStream.on('finish', async () => {
      // Consulta para obtener el archivo de GridFS con ese ID
      const storedFile = await gfsBucket
        .find({ _id: gridFsId })
        .toArray();

      if (!storedFile || storedFile.length === 0) {
        return res.status(404).json({ message: 'No se pudo recuperar el archivo de GridFS' });
      }

      const newFile = new File({
        filename: storedFile[0].filename,
        originalname: file.originalname,
        contentType: file.mimetype,
        size: file.size,
        metadata: {
          ...metadata,
          gridFsId: storedFile[0]._id,
        },
      });

      await newFile.save();

      res.status(201).json({ message: 'Archivo subido con éxito', file: newFile });
    });

    uploadStream.on('error', (error) => {
      console.error('Error subiendo a GridFS:', error);
      res.status(500).json({ message: 'Error al guardar archivo en GridFS', error });
    });

  } catch (error) {
    console.error("Error al subir archivo:", error);
    res.status(500).json({ message: 'Error al subir el archivo', error });
  }
};
