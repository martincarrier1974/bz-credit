import { useRef, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import type { Expense } from '@bz-credit/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Pencil, Trash2, Paperclip, FileImage } from 'lucide-react';

type Props = {
  data: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onToggleValidated: (expense: Expense) => void;
  onUploadReceipt: (id: string, file: File) => void;
  uploadingId: string | null;
};

export function ExpensesTable({
  data,
  onEdit,
  onDelete,
  onToggleValidated,
  onUploadReceipt,
  uploadingId,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const triggerFileInput = (id: string) => {
    setPendingId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && pendingId) {
      onUploadReceipt(pendingId, file);
      setPendingId(null);
      e.target.value = '';
    }
  };

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: 'title',
      header: 'Titre / Description',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {row.original.title}
          </div>
          {row.original.description && (
            <div className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorFn: (r) => r.employee.name,
      id: 'employee',
      header: 'Employé',
      cell: ({ getValue }) => (
        <span className="text-slate-800 dark:text-slate-200">{getValue() as string}</span>
      ),
    },
    {
      accessorFn: (r) => r.supplier.name,
      id: 'supplier',
      header: 'Fournisseur',
      cell: ({ getValue }) => (
        <span className="text-slate-800 dark:text-slate-200">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => (
        <span className="text-slate-700 dark:text-slate-300">
          {formatDate(getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Montant',
      cell: ({ getValue }) => (
        <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
          {formatCurrency(getValue() as number)}
        </span>
      ),
    },
    {
      accessorKey: 'tps',
      header: 'TPS',
      cell: ({ getValue }) => (
        <span className="tabular-nums text-slate-700 dark:text-slate-300">
          {formatCurrency(getValue() as number)}
        </span>
      ),
    },
    {
      accessorKey: 'tvq',
      header: 'TVQ',
      cell: ({ getValue }) => (
        <span className="tabular-nums text-slate-700 dark:text-slate-300">
          {formatCurrency(getValue() as number)}
        </span>
      ),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ getValue }) => (
        <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
          {formatCurrency(getValue() as number)}
        </span>
      ),
    },
    {
      accessorFn: (r) => r.category.name,
      id: 'category',
      header: 'Catégorie',
      cell: ({ getValue }) => (
        <span className="text-slate-700 dark:text-slate-300">{getValue() as string}</span>
      ),
    },
    {
      accessorFn: (r) => r.glAccount,
      id: 'gl',
      header: 'GL',
      cell: ({ row }) => (
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {row.original.glAccount.code} – {row.original.glAccount.name}
        </span>
      ),
    },
    {
      accessorKey: 'hasInvoice',
      header: 'Facture',
      cell: ({ row }) =>
        row.original.hasInvoice ? (
          <Badge variant="success">Oui</Badge>
        ) : (
          <Badge variant="secondary">Non</Badge>
        ),
    },
    {
      accessorKey: 'validated',
      header: 'Validé comptable',
      cell: ({ row }) => (
        <Switch
          checked={row.original.validated}
          onCheckedChange={() => onToggleValidated(row.original)}
        />
      ),
    },
    {
      accessorKey: 'receiptPath',
      id: 'receipt',
      header: 'Reçu',
      cell: ({ row }) => {
        const exp = row.original;
        const uploading = uploadingId === exp.id;
        return (
          <div className="flex items-center gap-1">
            {exp.receiptPath ? (
              <a
                href={exp.receiptPath}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded px-2 py-1 text-sm text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                title="Voir le reçu"
              >
                <FileImage className="h-4 w-4" /> Voir
              </a>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              title="Téléverser reçu"
              disabled={uploading}
              onClick={() => triggerFileInput(exp.id)}
              className="h-10 w-10 text-slate-600 dark:text-slate-400"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            title="Modifier"
            className="h-10 w-10 text-slate-600 dark:text-slate-400"
          >
            <Pencil className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original.id)}
            title="Supprimer"
            className="h-10 w-10 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10 border-b-2 border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 whitespace-nowrap dark:text-slate-300"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={`border-b border-slate-200 transition-colors dark:border-slate-700/50 ${
                  index % 2 === 0
                    ? 'bg-slate-100 dark:bg-slate-800/70'
                    : 'bg-white dark:bg-slate-800/40'
                } hover:bg-slate-200 dark:hover:bg-slate-700/50`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-5 py-4 text-base text-slate-900 whitespace-nowrap dark:text-slate-100"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}
