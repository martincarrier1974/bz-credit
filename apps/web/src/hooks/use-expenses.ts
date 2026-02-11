import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Expense } from '@bz-credit/shared';
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  uploadReceipt,
  type ExpenseQuery,
} from '@/api/client';

export type ExpensesResponse = { expenses: Expense[]; totals: { amount: number; tps: number; tvq: number; total: number } };

export function useExpensesQuery(params: ExpenseQuery) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => fetchExpenses(params),
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createExpense(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      updateExpense(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useUploadReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadReceipt(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
