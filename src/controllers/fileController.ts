import { Request, Response } from 'express';
import { MongoClient, GridFSBucket } from 'mongodb';
import File from "../models/File"; // Asegúrate de que sea tu modelo correcto
import Repository from "../models/Repository"; // Asegúrate de que sea el modelo de repositorio correcto

export const uploadFileToPersonalRepo = async (req: Request, res: Response) => {
    const { name, description, importance, tags, privacy, repositoryId } = req.body;
    const file = req.file;

    if (!file) res.status(400).json({ message: 'Archivo no recibido' });

    try {
        const client = await MongoClient.connect(process.env.MONGO_URI || '');
        const db = client.db(process.env.DB_NAME);
        const bucket = new GridFSBucket(db, { bucketName: 'userFiles' });

        const uploadStream = bucket.openUploadStream(name, {
            metadata: {
                userId: (req as any).user.id,
                description,
                importance,
                tags: JSON.parse(tags),
                privacy,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                uploadedAt: new Date(),
            },
        });

        uploadStream.end(file.buffer);

        uploadStream.on('finish', async () => {
            try {
                // Guardar metadatos en MongoDB (colección File)
                const newFile = new File({
                    name,
                    description,
                    importance,
                    tags: JSON.parse(tags),
                    privacy,
                    owner: (req as any).user.id,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    fileId: uploadStream.id, // ID de GridFS
                });

                await newFile.save();

                // Actualizar el repositorio y asociar el archivo subido
                await Repository.findByIdAndUpdate(repositoryId, {
                    $push: {
                        files: {
                            _id: uploadStream.id,
                            name,
                            description,
                            importance,
                            tags: JSON.parse(tags),
                            privacy,
                        },
                    },
                });

                res.status(201).json({ message: 'Archivo subido y vinculado con éxito', fileId: uploadStream.id });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Error al guardar metadatos o actualizar repositorio' });
            }
        });

        uploadStream.on('error', (err) => {
            console.error(err);
            res.status(500).json({ message: 'Error al subir archivo' });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const getUserFiles = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const files = await File.find({ owner: userId }).sort({ createdAt: -1 }); // Orden por fecha de subida reciente

        res.json(files);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al recuperar archivos' });
    }
};
