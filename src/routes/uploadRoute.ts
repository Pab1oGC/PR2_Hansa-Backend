// routes/uploadRoute.js
const express = require("express");
const multer = require("multer");
const { MongoClient, GridFSBucket } = require("mongodb");
const router = express.Router();

// Multer config: guarda el archivo en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta protegida (requiere token y req.user.id del middleware de auth)
router.post("/upload-to-personal", upload.single("file"), async (req: { body: { name: any; description: any; importance: any; tags: any; privacy: any; }; file: any; user: { id: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; fileId?: any; }): void; new(): any; }; }; }) => {
  const { name, description, importance, tags, privacy } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "Archivo no recibido" });

  try {
    const client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db(process.env.DB_NAME);

    // Crear bucket para archivos
    const bucket = new GridFSBucket(db, { bucketName: "userFiles" });

    // Subir archivo a GridFS
    const uploadStream = bucket.openUploadStream(name, {
      metadata: {
        userId: req.user?.id || "desconocido",
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

    uploadStream.on("finish", () => {
      res.status(201).json({ message: "Archivo subido con éxito", fileId: uploadStream.id });
    });

    uploadStream.on("error", (err: any) => {
      console.error(err);
      res.status(500).json({ message: "Error al subir archivo" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

module.exports = router;
