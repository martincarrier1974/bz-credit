import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '../lib/encrypt.js';

const prisma = new PrismaClient();
export const glAccountsRouter = Router();

function decryptGlAccount(g: { id: string; code: string; name: string; company?: string | null }) {
  return {
    id: g.id,
    code: (decrypt(g.code) ?? g.code) as string,
    name: (decrypt(g.name) ?? g.name) as string,
    company: g.company ? (decrypt(g.company) ?? g.company) ?? null : g.company,
  };
}

glAccountsRouter.get('/', async (_req, res) => {
  try {
    const rows = await prisma.glAccount.findMany();
    const accounts = rows.map(decryptGlAccount);
    accounts.sort((a: { company?: string | null; code: string }, b: { company?: string | null; code: string }) =>
      (a.company ?? '').localeCompare(b.company ?? '') || a.code.localeCompare(b.code)
    );
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
    const enc = (s: string | null) => (s ? (encrypt(s) ?? s) : null);
    const account = await prisma.glAccount.create({
      data: {
        code: enc(code.trim()) ?? code.trim(),
        name: enc(name.trim()) ?? name.trim(),
        company: company && typeof company === 'string' && company.trim() ? (enc(company.trim()) ?? company.trim()) : null,
      },
    });
    return res.status(201).json(decryptGlAccount(account));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

glAccountsRouter.put('/:id', async (req, res) => {
  try {
    const { code, name, company } = req.body;
    const enc = (s: string | null) => (s ? (encrypt(s) ?? s) : null);
    const data: Record<string, string | null> = {};
    if (code != null && typeof code === 'string') data.code = enc(code.trim()) ?? code.trim();
    if (name != null && typeof name === 'string') data.name = enc(name.trim()) ?? name.trim();
    if (company !== undefined) data.company = company && typeof company === 'string' && company.trim() ? (enc(company.trim()) ?? company.trim()) : null;
    const account = await prisma.glAccount.update({
      where: { id: req.params.id },
      data,
    });
    return res.json(decryptGlAccount(account));
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
