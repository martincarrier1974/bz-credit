import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import {
  expenseCreateSchema,
  expenseUpdateSchema,
  expenseQuerySchema,
} from '@bz-credit/shared';
import { uploadReceipt } from '../middleware/upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads');
const prisma = new PrismaClient();
export const expensesRouter = Router();

function total(amount: number, tps: number, tvq: number) {
  return amount + tps + tvq;
}

async function getDefaultCategoryId(): Promise<string> {
  const cat = await prisma.category.findFirst({ orderBy: { name: 'asc' } });
  if (!cat) throw new Error('Aucune catégorie. Exécutez db:seed.');
  return cat.id;
}

async function getOrCreateSupplierId(name: string): Promise<string> {
  const trimmed = name.trim();
  let supplier = await prisma.supplier.findFirst({
    where: { name: trimmed },
  });
  if (!supplier) {
    supplier = await prisma.supplier.create({ data: { name: trimmed } });
  }
  return supplier.id;
}

expensesRouter.get('/', async (req, res) => {
  try {
    const parsed = expenseQuerySchema.safeParse({
      from: req.query.from,
      to: req.query.to,
      validated: req.query.validated ?? 'all',
      hasInvoice: req.query.hasInvoice ?? 'all',
      search: req.query.search ?? '',
    });
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { from, to, validated, hasInvoice, search } = parsed.data;

    const where: Record<string, unknown> = {};
    if (from || to) {
      where.date = {};
      if (from) (where.date as Record<string, string>).gte = from;
      if (to) (where.date as Record<string, string>).lte = to;
    }
    if (validated === 'true') where.validated = true;
    if (validated === 'false') where.validated = false;
    if (hasInvoice === 'true') where.hasInvoice = true;
    if (hasInvoice === 'false') where.hasInvoice = false;
    if (search.trim()) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        employee: true,
        supplier: true,
        category: true,
        glAccount: true,
      },
      orderBy: { date: 'desc' },
    });

    const rows = expenses.map((e: (typeof expenses)[number]) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      employeeId: e.employeeId,
      employee: { id: e.employee.id, name: e.employee.name },
      supplierId: e.supplierId,
      supplier: { id: e.supplier.id, name: e.supplier.name },
      date: e.date,
      amount: e.amount,
      tps: e.tps,
      tvq: e.tvq,
      total: total(e.amount, e.tps, e.tvq),
      categoryId: e.categoryId,
      category: { id: e.category.id, name: e.category.name },
      glAccountId: e.glAccountId,
      glAccount: {
        id: e.glAccount.id,
        code: e.glAccount.code,
        name: e.glAccount.name,
      },
      hasInvoice: e.hasInvoice,
      validated: e.validated,
      receiptPath: e.receiptPath,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));

    const totals = rows.reduce<{ amount: number; tps: number; tvq: number; total: number }>(
      (acc, r) => ({
        amount: acc.amount + r.amount,
        tps: acc.tps + r.tps,
        tvq: acc.tvq + r.tvq,
        total: acc.total + r.total,
      }),
      { amount: 0, tps: 0, tvq: 0, total: 0 }
    );

    return res.json({ expenses: rows, totals });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

expensesRouter.post('/', async (req, res) => {
  try {
    const parsed = expenseCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const data = parsed.data;
    const supplierId = await getOrCreateSupplierId(data.supplierName);
    const categoryId = data.categoryId ?? (await getDefaultCategoryId());
    const expense = await prisma.expense.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        employeeId: data.employeeId,
        supplierId,
        date: data.date,
        amount: data.amount,
        tps: data.tps,
        tvq: data.tvq,
        categoryId,
        glAccountId: data.glAccountId,
        hasInvoice: data.hasInvoice,
        validated: data.validated,
      },
      include: {
        employee: true,
        supplier: true,
        category: true,
        glAccount: true,
      },
    });
    const row = {
      id: expense.id,
      title: expense.title,
      description: expense.description,
      employeeId: expense.employeeId,
      employee: { id: expense.employee.id, name: expense.employee.name },
      supplierId: expense.supplierId,
      supplier: { id: expense.supplier.id, name: expense.supplier.name },
      date: expense.date,
      amount: expense.amount,
      tps: expense.tps,
      tvq: expense.tvq,
      total: total(expense.amount, expense.tps, expense.tvq),
      categoryId: expense.categoryId,
      category: { id: expense.category.id, name: expense.category.name },
      glAccountId: expense.glAccountId,
      glAccount: {
        id: expense.glAccount.id,
        code: expense.glAccount.code,
        name: expense.glAccount.name,
      },
      hasInvoice: expense.hasInvoice,
      validated: expense.validated,
      receiptPath: expense.receiptPath,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    };
    return res.status(201).json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

expensesRouter.put('/:id', async (req, res) => {
  try {
    const parsed = expenseUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const data = parsed.data;
    const updateData: Record<string, unknown> = {
      ...(data.title != null && { title: data.title }),
      ...(data.description !== undefined && { description: data.description ?? null }),
      ...(data.employeeId != null && { employeeId: data.employeeId }),
      ...(data.date != null && { date: data.date }),
        ...(data.amount != null && { amount: data.amount }),
        ...(data.tps != null && { tps: data.tps }),
        ...(data.tvq != null && { tvq: data.tvq }),
        ...(data.categoryId != null && { categoryId: data.categoryId }),
        ...(data.glAccountId != null && { glAccountId: data.glAccountId }),
        ...(data.hasInvoice !== undefined && { hasInvoice: data.hasInvoice }),
        ...(data.validated !== undefined && { validated: data.validated }),
      };
    if (data.supplierName != null) {
      updateData.supplierId = await getOrCreateSupplierId(data.supplierName);
    }
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        employee: true,
        supplier: true,
        category: true,
        glAccount: true,
      },
    });
    const row = {
      id: expense.id,
      title: expense.title,
      description: expense.description,
      employeeId: expense.employeeId,
      employee: { id: expense.employee.id, name: expense.employee.name },
      supplierId: expense.supplierId,
      supplier: { id: expense.supplier.id, name: expense.supplier.name },
      date: expense.date,
      amount: expense.amount,
      tps: expense.tps,
      tvq: expense.tvq,
      total: total(expense.amount, expense.tps, expense.tvq),
      categoryId: expense.categoryId,
      category: { id: expense.category.id, name: expense.category.name },
      glAccountId: expense.glAccountId,
      glAccount: {
        id: expense.glAccount.id,
        code: expense.glAccount.code,
        name: expense.glAccount.name,
      },
      hasInvoice: expense.hasInvoice,
      validated: expense.validated,
      receiptPath: expense.receiptPath,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    };
    return res.json(row);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2025') {
      return res.status(404).json({ error: 'Expense not found' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

expensesRouter.post('/:id/receipt', (req, res, next) => {
  fs.mkdirSync(uploadsDir, { recursive: true });
  uploadReceipt(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message ?? 'Upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier reçu' });
    }
    try {
      const receiptPath = `/uploads/${req.file.filename}`;
      await prisma.expense.update({
        where: { id: req.params.id },
        data: { receiptPath },
      });
      return res.json({ receiptPath });
    } catch (e: unknown) {
      console.error(e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
});

expensesRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2025') {
      return res.status(404).json({ error: 'Expense not found' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
