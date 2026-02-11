import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const metaRouter = Router();

metaRouter.get('/', async (_req, res) => {
  try {
    const [employees, categories, glAccounts, suppliers] = await Promise.all([
      prisma.employee.findMany({ orderBy: { name: 'asc' } }),
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
      prisma.glAccount.findMany({ orderBy: { code: 'asc' } }),
      prisma.supplier.findMany({ orderBy: { name: 'asc' } }),
    ]);
    return res.json({
      employees: employees.map((e: { id: string; name: string }) => ({ id: e.id, name: e.name })),
      categories: categories.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })),
      glAccounts: glAccounts.map((g: { id: string; code: string; name: string }) => ({ id: g.id, code: g.code, name: g.name })),
      suppliers: suppliers.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
