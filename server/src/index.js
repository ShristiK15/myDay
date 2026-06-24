import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import { errorHandler } from './middleware/errorHandler.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import entryRoutes from './routes/entryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import letterRoutes from './routes/letterRoutes.js';
import reflectionRoutes from './routes/reflectionRoutes.js';


dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

configureCloudinary();
connectDB().catch((err) => console.error('DB connection failed:', err.message));


app.use(
  cors({
    origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'MyDay API' }));

app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/letters', letterRoutes);
app.use('/api/reflections', reflectionRoutes);

app.use(errorHandler);

app.listen(PORT,"0.0.0.0", () => console.log(`MyDay server running on port ${PORT}`));
