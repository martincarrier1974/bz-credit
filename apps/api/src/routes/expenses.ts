import { Router } from 'express';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import {
  expenseCreateSchema,
  expenseUpdateSchema,
  expenseQuerySchema,
} from '@bz-credit/shared';
import { uploadReceipt } from '../middleware/upload.js';
import { encryptDeterministic, decrypt } from '../lib/encrypt.js';

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
  const encName = encryptDeterministic(trimmed);
  let supplier = await prisma.supplier.findFirst({
    where: { name: encName },
  });
  if (!supplier) {
    supplier = await prisma.supplier.create({ data: { name: encName } });
  }
  return supplier.id;
}

function decryptSupplier(s: { id: string; name: string }) {
  return { id: s.id, name: decrypt(s.name) ?? s.name };
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
      employee: { id: e.employee.id, name: decrypt(e.employee.name) ?? e.employee.name },
      supplierId: e.supplierId,
      supplier: decryptSupplier(e.supplier),
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
        code: decrypt(e.glAccount.code) ?? e.glAccount.code,
        name: decrypt(e.glAccount.name) ?? e.glAccount.name,
      },
      hasInvoice: e.hasInvoice,
      validated: e.validated,
      enteredBy: e.enteredBy,
      receiptPath: e.receiptFile
        ? `/api/expenses/${e.id}/receipt`
        : e.receiptPath,
      receiptMimeType: e.receiptMimeType ?? undefined,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));

    type Totals = { amount: number; tps: number; tvq: number; total: number };
    const totals = rows.reduce(
      (acc: Totals, r: (typeof rows)[number]) => ({
        amount: acc.amount + r.amount,
        tps: acc.tps + r.tps,
        tvq: acc.tvq + r.tvq,
        total: acc.total + r.total,
      }),
      { amount: 0, tps: 0, tvq: 0, total: 0 } satisfies Totals
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
        enteredBy: data.enteredBy?.trim() || null,
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
      employee: { id: expense.employee.id, name: decrypt(expense.employee.name) ?? expense.employee.name },
      supplierId: expense.supplierId,
      supplier: decryptSupplier(expense.supplier),
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
        code: decrypt(expense.glAccount.code) ?? expense.glAccount.code,
        name: decrypt(expense.glAccount.name) ?? expense.glAccount.name,
      },
      hasInvoice: expense.hasInvoice,
      validated: expense.validated,
      enteredBy: expense.enteredBy,
      receiptPath: expense.receiptFile
        ? `/api/expenses/${expense.id}/receipt`
        : expense.receiptPath,
      receiptMimeType: expense.receiptMimeType ?? undefined,
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
        ...(data.enteredBy !== undefined && { enteredBy: data.enteredBy?.trim() || null }),
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
      employee: { id: expense.employee.id, name: decrypt(expense.employee.name) ?? expense.employee.name },
      supplierId: expense.supplierId,
      supplier: decryptSupplier(expense.supplier),
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
        code: decrypt(expense.glAccount.code) ?? expense.glAccount.code,
        name: decrypt(expense.glAccount.name) ?? expense.glAccount.name,
      },
      hasInvoice: expense.hasInvoice,
      validated: expense.validated,
      enteredBy: expense.enteredBy,
      receiptPath: expense.receiptFile
        ? `/api/expenses/${expense.id}/receipt`
        : expense.receiptPath,
      receiptMimeType: expense.receiptMimeType ?? undefined,
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

expensesRouter.get('/:id/receipt', async (req, res) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id },
      select: { receiptFile: true, receiptMimeType: true, receiptPath: true },
    });
    if (!expense?.receiptFile) {
      return res.status(404).json({ error: 'Reçu non trouvé' });
    }
    const mime = expense.receiptMimeType ?? 'application/octet-stream';
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `inline; filename="${expense.receiptPath ?? 'receipt'}"`);
    return res.send(Buffer.from(expense.receiptFile));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

expensesRouter.post('/:id/receipt', (req, res, next) => {
  uploadReceipt(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message ?? 'Upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier reçu' });
    }
    try {
      const filename = req.file.originalname || `receipt${path.extname(req.file.originalname || '')}`;
      await prisma.expense.update({
        where: { id: req.params.id },
        data: {
          receiptPath: filename,
          receiptFile: req.file.buffer,
          receiptMimeType: req.file.mimetype,
          hasInvoice: true,
        },
      });
      return res.json({ receiptPath: `/api/expenses/${req.params.id}/receipt` });
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
