import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  fetchEmployees,
  fetchCreditCards,
  createEmployee,
  createCreditCard,
  deleteEmployee,
  deleteCreditCard,
} from '@/api/client';
import { Users, CreditCard, Plus, Trash2 } from 'lucide-react';

export type ManagementTab = 'employees' | 'cards';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: ManagementTab;
};

export function ManagementDrawer({ open, onOpenChange, initialTab = 'employees' }: Props) {
  const [tab, setTab] = useState<ManagementTab>(initialTab);
  const qc = useQueryClient();
  const { data: employees = [], refetch: refetchEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
    enabled: open,
  });
  const { data: creditCards = [] } = useQuery({
    queryKey: ['credit-cards'],
    queryFn: fetchCreditCards,
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      refetchEmployees();
    }
  }, [open, initialTab, refetchEmployees]);

  const createEmp = useMutation({
    mutationFn: (name: string) => createEmployee(name),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['employees'] });
      qc.invalidateQueries({ queryKey: ['meta'] });
    },
  });
  const createCard = useMutation({
    mutationFn: (body: Record<string, unknown>) => createCreditCard(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit-cards'] });
      qc.invalidateQueries({ queryKey: ['meta'] });
    },
  });
  const delEmp = useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      qc.invalidateQueries({ queryKey: ['meta'] });
    },
  });
  const delCard = useMutation({
    mutationFn: (id: string) => deleteCreditCard(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit-cards'] });
      qc.invalidateQueries({ queryKey: ['meta'] });
    },
  });

  const [newEmpName, setNewEmpName] = useState('');
  const [newCard, setNewCard] = useState({
    name: '',
    cardNumber: '',
    type: '',
    expirationMonth: '',
    expirationYear: '',
    active: true,
    email: '',
    description: '',
    employeeId: '',
  });

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;
    createEmp.mutate(newEmpName.trim(), {
      onSuccess: () => setNewEmpName(''),
    });
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.name.trim() || !newCard.employeeId) return;
    createCard.mutate(
      {
        name: newCard.name.trim(),
        cardNumber: newCard.cardNumber || undefined,
        type: newCard.type || undefined,
        expirationMonth: newCard.expirationMonth || undefined,
        expirationYear: newCard.expirationYear || undefined,
        active: newCard.active,
        email: newCard.email || undefined,
        description: newCard.description || undefined,
        employeeId: newCard.employeeId,
      },
      {
        onSuccess: () =>
          setNewCard({
            name: '',
            cardNumber: '',
            type: '',
            expirationMonth: '',
            expirationYear: '',
            active: true,
            email: '',
            description: '',
            employeeId: '',
          }),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Gestion — Employés et cartes"
        onClose={() => onOpenChange(false)}
        className="max-h-[90vh] max-w-2xl overflow-y-auto"
      >
        <div className="flex gap-2 border-b border-slate-200 pb-4 dark:border-slate-600">
          <Button
            variant={tab === 'employees' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab('employees')}
          >
            <Users className="mr-2 h-4 w-4" />
            Employés
          </Button>
          <Button
            variant={tab === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab('cards')}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Cartes de crédit
          </Button>
        </div>

        {tab === 'employees' && (
          <div className="space-y-4">
            <form onSubmit={handleAddEmployee} className="flex gap-2">
              <Input
                value={newEmpName}
                onChange={(e) => setNewEmpName(e.target.value)}
                placeholder="Nom de l'employé"
                className="flex-1"
              />
              <Button type="submit" disabled={createEmp.isPending}>
                <Plus className="mr-1 h-4 w-4" /> Ajouter
              </Button>
            </form>
            <ul className="divide-y divide-slate-200 dark:divide-slate-600">
              {employees.map((emp) => (
                <li
                  key={emp.id}
                  className="flex items-center justify-between py-2"
                >
                  <span className="font-medium">{emp.name}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {emp.creditCards?.length ?? 0} carte(s)
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (window.confirm(`Supprimer ${emp.name} ?`))
                        delEmp.mutate(emp.id);
                    }}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'cards' && (
          <div className="space-y-4">
            <form onSubmit={handleAddCard} className="grid gap-4">
              <div className="grid gap-2">
                <Label>Employé</Label>
                <Select
                  value={newCard.employeeId}
                  onValueChange={(v) =>
                    setNewCard((s) => ({ ...s, employeeId: v }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Nom de la carte</Label>
                <Input
                  value={newCard.name}
                  onChange={(e) =>
                    setNewCard((s) => ({ ...s, name: e.target.value }))
                  }
                  placeholder="Ex: Visa corporative"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>No carte (4 derniers chiffres)</Label>
                  <Input
                    value={newCard.cardNumber}
                    onChange={(e) =>
                      setNewCard((s) => ({ ...s, cardNumber: e.target.value }))
                    }
                    placeholder="****1234"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Input
                    value={newCard.type}
                    onChange={(e) =>
                      setNewCard((s) => ({ ...s, type: e.target.value }))
                    }
                    placeholder="Visa, Mastercard..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Mois expiration</Label>
                  <Input
                    value={newCard.expirationMonth}
                    onChange={(e) =>
                      setNewCard((s) => ({
                        ...s,
                        expirationMonth: e.target.value,
                      }))
                    }
                    placeholder="01-12"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Année expiration</Label>
                  <Input
                    value={newCard.expirationYear}
                    onChange={(e) =>
                      setNewCard((s) => ({
                        ...s,
                        expirationYear: e.target.value,
                      }))
                    }
                    placeholder="2026"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newCard.email}
                  onChange={(e) =>
                    setNewCard((s) => ({ ...s, email: e.target.value }))
                  }
                  placeholder="email@exemple.com"
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Input
                  value={newCard.description}
                  onChange={(e) =>
                    setNewCard((s) => ({ ...s, description: e.target.value }))
                  }
                  placeholder="Description optionnelle"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newCard.active}
                  onCheckedChange={(v) =>
                    setNewCard((s) => ({ ...s, active: v }))
                  }
                />
                <Label>Actif</Label>
              </div>
              <Button type="submit" disabled={createCard.isPending}>
                <Plus className="mr-1 h-4 w-4" /> Ajouter la carte
              </Button>
            </form>
            <ul className="divide-y divide-slate-200 dark:divide-slate-600">
              {creditCards.map((card) => (
                <li
                  key={card.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <span className="font-medium">{card.name}</span>
                    <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                      — {card.employee.name}
                      {card.cardNumber && ` · ${card.cardNumber}`}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (window.confirm(`Supprimer la carte ${card.name} ?`))
                        delCard.mutate(card.id);
                    }}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
