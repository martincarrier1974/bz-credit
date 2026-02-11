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
  enteredBy: string;
  hasInvoice: boolean;
  validated: boolean;
};

// Taux applicables au Québec
const TPS_RATE = 0.05;
const TVQ_RATE = 0.09975;
const FACTEUR_TOTAL = 1 + TPS_RATE + TVQ_RATE; // 1.14975

/** Calcule montant HT, TPS, TVQ à partir du montant total (inverse) */
function calculDepuisTotal(montantTotal: number): {
  amount: number;
  tps: number;
  tvq: number;
} {
  const amount = Math.round((montantTotal / FACTEUR_TOTAL) * 100) / 100;
  const tps = Math.round(amount * TPS_RATE * 100) / 100;
  const tvq = Math.round(amount * TVQ_RATE * 100) / 100;
  return { amount, tps, tvq };
}

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
  enteredBy: '',
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
    enteredBy: e.enteredBy ?? '',
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
  const [montantTotalInput, setMontantTotalInput] = useState('');
  useEffect(() => {
    const f = expenseToForm(expense);
    setState(f);
    const total =
      (parseFloat(f.amount) || 0) + (parseFloat(f.tps) || 0) + (parseFloat(f.tvq) || 0);
    setMontantTotalInput(total ? String(total) : '');
  }, [expense, open]);

  const handleMontantTotalChange = (val: string) => {
    setMontantTotalInput(val);
    const total = parseFloat(val) || 0;
    if (total > 0) {
      const { amount, tps, tvq } = calculDepuisTotal(total);
      setState((s) => ({
        ...s,
        amount: String(amount),
        tps: String(tps),
        tvq: String(tvq),
      }));
    } else {
      setState((s) => ({ ...s, amount: '', tps: '', tvq: '' }));
    }
  };

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
                <Label>Montant total (avec taxes)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={montantTotalInput}
                  onChange={(e) => handleMontantTotalChange(e.target.value)}
                  placeholder="Ex: 114.98"
                />
              </div>
              <div className="grid gap-2">
                <Label>TPS (5%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  readOnly
                  className="bg-muted"
                  value={state.tps}
                />
              </div>
              <div className="grid gap-2">
                <Label>TVQ (9,975%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  readOnly
                  className="bg-muted"
                  value={state.tvq}
                />
              </div>
              <div className="grid gap-2">
                <Label>Montant hors taxes</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  readOnly
                  className="bg-muted"
                  value={state.amount}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Compte GL</Label>
              <Select
                value={state.glAccountId || undefined}
                onValueChange={(v) =>
                  setState((s) => ({ ...s, glAccountId: v }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un compte GL" />
                </SelectTrigger>
                <SelectContent className="z-[100]" position="popper">
                  {(meta?.glAccounts ?? []).length === 0 ? (
                    <div className="px-3 py-4 text-sm text-slate-500">
                      Aucun compte GL. Ajoutez-en via le bouton GL.
                    </div>
                  ) : (
                    (meta?.glAccounts ?? []).map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.code} – {g.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Entré par qui</Label>
              <Input
                value={state.enteredBy}
                onChange={(e) =>
                  setState((s) => ({ ...s, enteredBy: e.target.value }))
                }
                placeholder="Nom de la personne qui a saisi la facture"
              />
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

