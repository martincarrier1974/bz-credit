import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '../lib/encrypt.js';

const prisma = new PrismaClient();
export const employeesRouter = Router();

function decryptEmployee(e: { id: string; name: string }) {
  return { id: e.id, name: decrypt(e.name) ?? e.name };
}

employeesRouter.get('/', async (_req, res) => {
  try {
    const rows = await prisma.employee.findMany({
      include: { creditCards: true },
    });
    const employees = rows
      .map((e) => ({
        ...e,
        name: decrypt(e.name) ?? e.name,
        creditCards: e.creditCards.map((c) => ({
          ...c,
          name: decrypt(c.name) ?? c.name,
        })),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return res.json(employees);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

employeesRouter.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Nom requis' });
    }
    const employee = await prisma.employee.create({
      data: { name: encrypt(name.trim()) ?? name.trim() },
    });
    return res.status(201).json(decryptEmployee(employee));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

employeesRouter.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Nom requis' });
    }
    const employee = await prisma.employee.update({
      where: { id: req.params.id },
      data: { name: encrypt(name.trim()) ?? name.trim() },
    });
    return res.json(decryptEmployee(employee));
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2025') {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

employeesRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.employee.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2025') {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
