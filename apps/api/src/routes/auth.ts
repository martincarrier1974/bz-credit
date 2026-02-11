import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-prod';
const JWT_EXPIRES = '7d';

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Identifiant et mot de passe requis' });
    }
    const user = await prisma.user.findUnique({
      where: { username: username.trim() },
    });
    if (!user) {
      return res.status(401).json({ error: 'Identifiant ou mot de passe invalide' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Identifiant ou mot de passe invalide' });
    }
    const token = jwt.sign(
      { sub: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    return res.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur interne' });
  }
});

authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; username: string };
    return res.json({ username: payload.username });
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
});
