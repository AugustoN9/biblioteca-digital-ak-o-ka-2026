import dns from 'dns';
// Força a resolução via DNS do Google para evitar o ECONNREFUSED do SRV no Windows
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { CategoryModel } from '../models/category.schema';

dotenv.config();

const seed = async () => {
  try {
    const mongoUri = process.env['MONGODB_URI'] || '';
    if (!mongoUri) {
      throw new Error('MONGODB_URI não foi definida no arquivo .env');
    }

    console.log('Conectando ao MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Conectado ao MongoDB com sucesso!');

    const jsonPath = path.join(__dirname, '../data/categories.json');
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      await CategoryModel.deleteMany({});
      await CategoryModel.insertMany(data);
      console.log(`Migração concluída com sucesso! ${data.length} categorias importadas.`);
    } else {
      console.log('Arquivo categories.json não encontrado para importação.');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Erro na migração:', error);
    process.exit(1);
  }
};

seed();