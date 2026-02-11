import { z } from 'zod';

export const expenseCreateSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  description: z.string().optional(),
  employeeId: z.string().min(1, 'Employé requis'),
  supplierName: z.string().min(1, 'Fournisseur requis'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (YYYY-MM-DD)'),
  amount: z.number().min(0),
  tps: z.number().min(0).default(0),
  tvq: z.number().min(0).default(0),
  categoryId: z.string().optional(),
  glAccountId: z.string().min(1, 'Compte GL requis'),
  hasInvoice: z.boolean().default(false),
  validated: z.boolean().default(false),
});

export const expenseUpdateSchema = expenseCreateSchema.partial();

export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;
export type ExpenseUpdateInput = z.infer<typeof expenseUpdateSchema>;

export const expenseQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  validated: z.enum(['all', 'true', 'false']).optional().default('all'),
  hasInvoice: z.enum(['all', 'true', 'false']).optional().default('all'),
  search: z.string().optional().default(''),
});

export type ExpenseQueryInput = z.infer<typeof expenseQuerySchema>;
