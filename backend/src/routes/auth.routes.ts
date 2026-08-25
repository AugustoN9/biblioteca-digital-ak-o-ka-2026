import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = 'segredo_jwt_super_seguro_minha_biblioteca_2026';

// Credenciais do Administrador
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Informe usuário e senha.' });
  }

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const token = jwt.sign(
      { username: ADMIN_CREDENTIALS.username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      message: 'Login realizado com sucesso!'
    });
  }

  return res.status(401).json({ message: 'Usuário ou senha incorretos.' });
});

export default router;