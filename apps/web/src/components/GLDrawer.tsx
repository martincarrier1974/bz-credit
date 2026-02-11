import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchGlAccounts, createGlAccount, deleteGlAccount } from '@/api/client';
import { Plus, Trash2 } from 'lucide-react';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GLDrawer({ open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const { data: glAccounts = [] } = useQuery({
    queryKey: ['gl-accounts'],
    queryFn: fetchGlAccounts,
    enabled: open,
  });

  const createGl = useMutation({
    mutationFn: (body: { code: string; name: string; company?: string }) =>
      createGlAccount(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gl-accounts'] });
      qc.invalidateQueries({ queryKey: ['meta'] });
    },
  });
  const delGl = useMutation({
    mutationFn: (id: string) => deleteGlAccount(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gl-accounts'] });
      qc.invalidateQueries({ queryKey: ['meta'] });
    },
  });

  const [newAccount, setNewAccount] = useState({
    code: '',
    name: '',
    company: '',
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.code.trim() || !newAccount.name.trim()) return;
    createGl.mutate(
      {
        code: newAccount.code.trim(),
        name: newAccount.name.trim(),
        company: newAccount.company.trim() || undefined,
      },
      {
        onSuccess: () =>
          setNewAccount({ code: '', name: '', company: '' }),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Départements grand livre"
        onClose={() => onOpenChange(false)}
        className="max-h-[90vh] max-w-2xl overflow-y-auto"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Code / N° compte</Label>
              <Input
                value={newAccount.code}
                onChange={(e) =>
                  setNewAccount((s) => ({ ...s, code: e.target.value }))
                }
                placeholder="Ex: 6100, 160001"
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                value={newAccount.name}
                onChange={(e) =>
                  setNewAccount((s) => ({ ...s, name: e.target.value }))
                }
                placeholder="Ex: BZ Cadeaux/Commandite"
              />
            </div>
            <div className="grid gap-2">
              <Label>Société</Label>
              <Input
                value={newAccount.company}
                onChange={(e) =>
                  setNewAccount((s) => ({ ...s, company: e.target.value }))
                }
                placeholder="Ex: BZ inc., BZ Telecom inc."
              />
            </div>
          </div>
          <Button type="submit" disabled={createGl.isPending}>
            <Plus className="mr-1 h-4 w-4" /> Ajouter
          </Button>
        </form>
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Liste des comptes GL ({glAccounts.length})
          </h3>
          <div className="max-h-[50vh] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/95">
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-sm font-medium">Description</th>
                  <th className="px-4 py-3 text-sm font-medium">N° compte</th>
                  <th className="px-4 py-3 text-sm font-medium">Société</th>
                  <th className="w-10 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {glAccounts.map((gl) => (
                  <tr
                    key={gl.id}
                    className="border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                  >
                    <td className="px-4 py-2 font-medium">{gl.name}</td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                      {gl.code}
                    </td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                      {gl.company || '—'}
                    </td>
                    <td className="px-2 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Supprimer « ${gl.name} » (${gl.code}) ?`
                            )
                          )
                            delGl.mutate(gl.id);
                        }}
                        className="h-8 w-8 text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {glAccounts.length === 0 && (
              <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                Aucun compte GL. Ajoutez-en un ci-dessus.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
