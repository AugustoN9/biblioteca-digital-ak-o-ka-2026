import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import categoryRoutes from './routes/category.routes';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3000;

app.use(cors());
app.use(express.json());

// Conexão com MongoDB
connectDatabase();

// Rotas da API
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});