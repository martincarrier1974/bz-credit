import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export type FilterState = {
  from: string;
  to: string;
  validated: 'all' | 'true' | 'false';
  hasInvoice: 'all' | 'true' | 'false';
  search: string;
};

type Props = {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
};

export function Filters({ filters, onFiltersChange }: Props) {
  const set = (patch: Partial<FilterState>) =>
    onFiltersChange({ ...filters, ...patch });

  return (
    <div className="flex flex-wrap items-end justify-between gap-6 rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex flex-wrap items-end gap-8">
        <div className="grid gap-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Du
          </Label>
          <Input
            type="date"
            value={filters.from}
            onChange={(e) => set({ from: e.target.value })}
            className="min-w-[11rem]"
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Au
          </Label>
          <Input
            type="date"
            value={filters.to}
            onChange={(e) => set({ to: e.target.value })}
            className="min-w-[11rem]"
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Recherche
          </Label>
          <Input
            placeholder="Titre, description…"
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            className="min-w-[14rem]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-8">
          <div>
            <Label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Validation comptable
            </Label>
            <RadioGroup
              value={filters.validated}
              onValueChange={(v) =>
                set({ validated: v as 'all' | 'true' | 'false' })
              }
              className="flex gap-5"
            >
              <label className="flex cursor-pointer items-center gap-2.5 text-base text-slate-700 dark:text-slate-300">
                <RadioGroupItem value="all" />
                Tout
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-base text-slate-700 dark:text-slate-300">
                <RadioGroupItem value="true" />
                Validé
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-base text-slate-700 dark:text-slate-300">
                <RadioGroupItem value="false" />
                Pas validé
              </label>
            </RadioGroup>
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Facture
            </Label>
            <RadioGroup
              value={filters.hasInvoice}
              onValueChange={(v) =>
                set({ hasInvoice: v as 'all' | 'true' | 'false' })
              }
              className="flex gap-5"
            >
              <label className="flex cursor-pointer items-center gap-2.5 text-base text-slate-700 dark:text-slate-300">
                <RadioGroupItem value="all" />
                Tout
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-base text-slate-700 dark:text-slate-300">
                <RadioGroupItem value="true" />
                Avec facture
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-base text-slate-700 dark:text-slate-300">
                <RadioGroupItem value="false" />
                Pas de facture
              </label>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
