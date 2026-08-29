import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.schema.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_jwt';

// Registro de conta de leitor
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'user-' + Date.now();

    const newUser = new User({
      id: userId,
      name,
      email,
      password: hashedPassword,
      role: 'reader',
      downloadHistory: []
    });

    await newUser.save();
    return res.status(201).json({ success: true, message: 'Conta criada com sucesso!' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
  }
});

// Login de usuário
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'E-mail ou senha inválidos.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'E-mail ou senha inválidos.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Erro ao realizar login', error: error.message });
  }
});

export default router;