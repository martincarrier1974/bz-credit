import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const glAccountsRouter = Router();

glAccountsRouter.get('/', async (_req, res) => {
  try {
    const accounts = await prisma.glAccount.findMany({
      orderBy: [{ company: 'asc' }, { code: 'asc' }],
    });
    return res.json(accounts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

glAccountsRouter.post('/', async (req, res) => {
  try {
    const { code, name, company } = req.body;
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: 'Code requis' });
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Description requise' });
    }
    const account = await prisma.glAccount.create({
      data: {
        code: code.trim(),
        name: name.trim(),
        company: company && typeof company === 'string' ? company.trim() || null : null,
      },
    });
    return res.status(201).json(account);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

glAccountsRouter.put('/:id', async (req, res) => {
  try {
    const { code, name, company } = req.body;
    const data: Record<string, string | null> = {};
    if (code != null && typeof code === 'string') data.code = code.trim();
    if (name != null && typeof name === 'string') data.name = name.trim();
    if (company !== undefined) data.company = company && typeof company === 'string' && company.trim() ? company.trim() : null;
    const account = await prisma.glAccount.update({
      where: { id: req.params.id },
      data,
    });
    return res.json(account);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2025') {
      return res.status(404).json({ error: 'Compte GL non trouvé' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

glAccountsRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.glAccount.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2025') {
      return res.status(404).json({ error: 'Compte GL non trouvé' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
