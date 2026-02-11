import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Expense } from '@bz-credit/shared';
import type { Meta } from '@bz-credit/shared';

export type ExpenseForm = {
  title: string;
  description: string;
  employeeId: string;
  supplierName: string;
  date: string;
  amount: string;
  tps: string;
  tvq: string;
  categoryId: string;
  glAccountId: string;
  hasInvoice: boolean;
  validated: boolean;
};

const emptyForm: ExpenseForm = {
  title: '',
  description: '',
  employeeId: '',
  supplierName: '',
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  tps: '',
  tvq: '',
  categoryId: '',
  glAccountId: '',
  hasInvoice: false,
  validated: false,
};

function expenseToForm(e: Expense | null): ExpenseForm {
  if (!e) return { ...emptyForm, date: new Date().toISOString().slice(0, 10) };
  return {
    title: e.title,
    description: e.description ?? '',
    employeeId: e.employeeId,
    supplierName: e.supplier.name,
    date: e.date,
    amount: String(e.amount),
    tps: String(e.tps),
    tvq: String(e.tvq),
    categoryId: e.categoryId,
    glAccountId: e.glAccountId,
    hasInvoice: e.hasInvoice,
    validated: e.validated,
  };
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  meta: Meta | null;
  saving: boolean;
  onSave: (data: ExpenseForm) => void; // parent converts to API payload
};

export function ExpenseDrawer({
  open,
  onOpenChange,
  expense,
  meta,
  saving,
  onSave,
}: Props) {
  const isEdit = !!expense?.id;
  const form = expenseToForm(expense);

  const [state, setState] = useState<ExpenseForm>(form);
  useEffect(() => {
    setState(expenseToForm(expense));
  }, [expense, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(state);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={isEdit ? 'Modifier la facture' : 'Nouvelle facture'}
        onClose={() => onOpenChange(false)}
        className="max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader />
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Titre / Description</Label>
              <Input
                value={state.title}
                onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
                placeholder="Titre"
                required
              />
              <Input
                value={state.description}
                onChange={(e) =>
                  setState((s) => ({ ...s, description: e.target.value }))
                }
                placeholder="Description (optionnel)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Employé</Label>
                <Select
                  value={state.employeeId}
                  onValueChange={(v) =>
                    setState((s) => ({ ...s, employeeId: v }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {meta?.employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Fournisseur</Label>
                <Input
                  value={state.supplierName}
                  onChange={(e) =>
                    setState((s) => ({ ...s, supplierName: e.target.value }))
                  }
                  placeholder="Nom du fournisseur"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={state.date}
                onChange={(e) => setState((s) => ({ ...s, date: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="grid gap-2">
                <Label>Montant</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={state.amount}
                  onChange={(e) =>
                    setState((s) => ({ ...s, amount: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>TPS</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={state.tps}
                  onChange={(e) =>
                    setState((s) => ({ ...s, tps: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>TVQ</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={state.tvq}
                  onChange={(e) =>
                    setState((s) => ({ ...s, tvq: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Compte GL</Label>
              <Select
                value={state.glAccountId}
                onValueChange={(v) =>
                  setState((s) => ({ ...s, glAccountId: v }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {meta?.glAccounts.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.code} – {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="validated"
                checked={state.validated}
                onCheckedChange={(v) =>
                  setState((s) => ({ ...s, validated: v }))
                }
              />
              <Label htmlFor="validated">Validé comptable</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

