import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Filters, type FilterState } from '@/components/Filters';
import { ExpensesTable } from '@/components/ExpensesTable';
import { ExpenseDrawer } from '@/components/ExpenseDrawer';
import { ManagementDrawer } from '@/components/ManagementDrawer';
import {
  useExpensesQuery,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  useUploadReceipt,
} from '@/hooks/use-expenses';
import { useMeta } from '@/hooks/use-meta';
import type { Expense } from '@bz-credit/shared';
import type { ExpenseForm } from '@/components/ExpenseDrawer';

const defaultFilters: FilterState = {
  from: '',
  to: '',
  validated: 'all',
  hasInvoice: 'all',
  search: '',
};

function buildQuery(f: FilterState) {
  return {
    from: f.from || undefined,
    to: f.to || undefined,
    validated: f.validated,
    hasInvoice: f.hasInvoice,
    search: f.search || undefined,
  };
}

function formToPayload(form: ExpenseForm) {
  const payload: Record<string, unknown> = {
    title: form.title,
    description: form.description || undefined,
    employeeId: form.employeeId,
    supplierName: form.supplierName,
    date: form.date,
    amount: parseFloat(form.amount) || 0,
    tps: parseFloat(form.tps) || 0,
    tvq: parseFloat(form.tvq) || 0,
    glAccountId: form.glAccountId,
    validated: form.validated,
  };
  if (form.categoryId) payload.categoryId = form.categoryId;
  return payload;
}

export default function App() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const query = useMemo(() => buildQuery(filters), [filters]);
  const { data, isLoading, isError, error } = useExpensesQuery(query);
  const meta = useMeta();
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();
  const uploadMutation = useUploadReceipt();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [managementTab, setManagementTab] = useState<'employees' | 'cards'>('employees');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const expenses = data?.expenses ?? [];

  const handleSave = (form: ExpenseForm) => {
    const payload = formToPayload(form);
    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, body: payload });
    } else {
      createMutation.mutate(payload);
    }
    setEditingExpense(null);
  };

  const handleToggleValidated = (expense: Expense) => {
    updateMutation.mutate({
      id: expense.id,
      body: { validated: !expense.validated },
    });
  };

  const saving =
    createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header
        onAddExpense={() => {
          setEditingExpense(null);
          setDrawerOpen(true);
        }}
        onOpenEmployés={() => {
          setManagementTab('employees');
          setManagementOpen(true);
        }}
        onOpenCartes={() => {
          setManagementTab('cards');
          setManagementOpen(true);
        }}
      />
      <main className="mx-auto max-w-[1800px] px-5 py-8 sm:px-8">
        <Filters
          filters={filters}
          onFiltersChange={setFilters}
        />
        <div className="mt-6">
          {isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-base text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error?.message ?? 'Erreur lors du chargement des dépenses.'}
            </div>
          )}
          {isLoading && (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-lg text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
              Chargement…
            </div>
          )}
          {!isLoading && !isError && (
            <ExpensesTable
              data={expenses}
              onEdit={(e) => {
                setEditingExpense(e);
                setDrawerOpen(true);
              }}
              onDelete={(id) => {
                if (window.confirm('Supprimer cette dépense ?')) {
                  deleteMutation.mutate(id);
                }
              }}
              onToggleValidated={handleToggleValidated}
              onUploadReceipt={(id, file) => uploadMutation.mutate({ id, file })}
              uploadingId={uploadMutation.isPending && uploadMutation.variables ? uploadMutation.variables.id : null}
            />
          )}
        </div>
      </main>
      <ManagementDrawer
        open={managementOpen}
        onOpenChange={setManagementOpen}
        initialTab={managementTab}
      />
      <ExpenseDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setEditingExpense(null);
        }}
        expense={editingExpense}
        meta={meta.data ?? null}
        saving={saving}
        onSave={handleSave}
      />
    </div>
  );
}
