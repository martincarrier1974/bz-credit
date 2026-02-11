import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const employeesRouter = Router();

employeesRouter.get('/', async (_req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: { creditCards: true },
      orderBy: { name: 'asc' },
    });
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
      data: { name: name.trim() },
    });
    return res.status(201).json(employee);
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
      data: { name: name.trim() },
    });
    return res.json(employee);
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
