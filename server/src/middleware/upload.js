import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|mp3|wav|m4a|webm|ogg/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype) || file.mimetype.startsWith('audio/') || file.mimetype.startsWith('image/');
  if (ext && mime) cb(null, true);
  else cb(new Error('Invalid file type'), false);
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 15 * 1024 * 1024 } });

export const uploadToCloudinary = async (filePath, resourceType = 'image') => {
  try {
    const cloudinary = (await import('../config/cloudinary.js')).default;
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return `/uploads/${path.basename(filePath)}`;
    }
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'myday',
      resource_type: resourceType === 'audio' ? 'video' : 'image',
    });
    fs.unlink(filePath, () => {});
    return result.secure_url;
  } catch {
    return `/uploads/${path.basename(filePath)}`;
  }
};
