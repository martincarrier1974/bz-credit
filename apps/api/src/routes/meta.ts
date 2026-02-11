import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { decrypt } from '../lib/encrypt.js';

const prisma = new PrismaClient();
export const metaRouter = Router();

metaRouter.get('/', async (_req, res) => {
  try {
    const [employees, categories, glAccounts, suppliers] = await Promise.all([
      prisma.employee.findMany(),
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
      prisma.glAccount.findMany(),
      prisma.supplier.findMany(),
    ]);
    const emp = employees.map((e: { id: string; name: string }) => ({ id: e.id, name: decrypt(e.name) ?? e.name }));
    emp.sort((a, b) => a.name.localeCompare(b.name));
    const gl = glAccounts.map((g: { id: string; code: string; name: string; company?: string | null }) => ({
      id: g.id,
      code: decrypt(g.code) ?? g.code,
      name: decrypt(g.name) ?? g.name,
      company: g.company ? (decrypt(g.company) ?? g.company) : undefined,
    }));
    gl.sort((a, b) => (a.company ?? '').localeCompare(b.company ?? '') || a.code.localeCompare(b.code));
    const sup = suppliers.map((s: { id: string; name: string }) => ({ id: s.id, name: decrypt(s.name) ?? s.name }));
    sup.sort((a, b) => a.name.localeCompare(b.name));
    return res.json({
      employees: emp,
      categories: categories.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })),
      glAccounts: gl,
      suppliers: sup,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
