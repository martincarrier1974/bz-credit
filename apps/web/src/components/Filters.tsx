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
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-3 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 sm:px-4">
      <div className="grid grid-cols-1 gap-4 sm:flex sm:flex-wrap sm:items-end sm:gap-6 md:gap-8">
        <div className="grid min-w-0 gap-2 sm:min-w-[11rem]">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Du
          </Label>
          <Input
            type="date"
            value={filters.from}
            onChange={(e) => set({ from: e.target.value })}
            className="w-full"
          />
        </div>
        <div className="grid min-w-0 gap-2 sm:min-w-[11rem]">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Au
          </Label>
          <Input
            type="date"
            value={filters.to}
            onChange={(e) => set({ to: e.target.value })}
            className="w-full"
          />
        </div>
        <div className="grid min-w-0 gap-2 sm:min-w-[14rem]">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Recherche
          </Label>
          <Input
            placeholder="Titre, description…"
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6 md:gap-8">
          <div>
            <Label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Validation comptable
            </Label>
            <RadioGroup
              value={filters.validated}
              onValueChange={(v) =>
                set({ validated: v as 'all' | 'true' | 'false' })
              }
              className="flex flex-wrap gap-4 sm:gap-5"
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
              className="flex flex-wrap gap-4 sm:gap-5"
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
