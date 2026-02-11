import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Pencil, Trash2, Paperclip, FileImage, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';

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
  const [viewingReceipt, setViewingReceipt] = useState<{
    id: string;
    url: string;
    mimeType?: string;
  } | null>(null);
  const [receiptFullscreen, setReceiptFullscreen] = useState(false);

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
        <div className="min-w-0 overflow-hidden">
          <div className="truncate font-medium text-slate-900 dark:text-slate-100" title={row.original.title}>
            {row.original.title}
          </div>
          {row.original.description && (
            <div className="truncate text-xs text-slate-500 dark:text-slate-400" title={row.original.description}>
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
        <span className="block truncate text-slate-800 dark:text-slate-200" title={getValue() as string}>{getValue() as string}</span>
      ),
    },
    {
      accessorFn: (r) => r.supplier.name,
      id: 'supplier',
      header: 'Fournisseur',
      cell: ({ getValue }) => (
        <span className="block truncate text-slate-800 dark:text-slate-200" title={getValue() as string}>{getValue() as string}</span>
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
        <span className="block truncate text-slate-700 dark:text-slate-300">{getValue() as string}</span>
      ),
    },
    {
      accessorFn: (r) => r.glAccount,
      id: 'gl',
      header: 'GL',
      cell: ({ row }) => (
        <span className="block truncate text-slate-700 dark:text-slate-300" title={`${row.original.glAccount.code} – ${row.original.glAccount.name}`}>
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
              <Button
                variant="ghost"
                size="sm"
                className="h-auto gap-1 px-2 py-1 text-sm text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                title="Voir le reçu"
                onClick={() =>
                  setViewingReceipt({
                    id: exp.id,
                    url: exp.receiptPath!,
                    mimeType: exp.receiptMimeType,
                  })
                }
              >
                <FileImage className="h-4 w-4" /> Voir
              </Button>
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
      <Dialog
        open={!!viewingReceipt}
        onOpenChange={(open) => {
          if (!open) {
            setViewingReceipt(null);
            setReceiptFullscreen(false);
          }
        }}
      >
        {viewingReceipt &&
          (receiptFullscreen
            ? createPortal(
                <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900">
                  <div className="flex shrink-0 items-center justify-between border-b border-slate-700 px-4 py-3">
                    <Button
                      variant="outline"
                      className="gap-2 text-white border-slate-600 hover:bg-slate-700"
                      onClick={() => setReceiptFullscreen(false)}
                    >
                      <Minimize2 className="h-4 w-4" /> Réduire
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 text-white border-slate-600 hover:bg-slate-700"
                      onClick={() => {
                        setViewingReceipt(null);
                        setReceiptFullscreen(false);
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" /> Retour
                    </Button>
                  </div>
                  <div className="min-h-0 flex-1 flex items-center justify-center overflow-hidden p-4">
                    {viewingReceipt.mimeType?.startsWith('image/') ? (
                      <img
                        src={viewingReceipt.url}
                        alt="Reçu"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <iframe
                        src={viewingReceipt.url}
                        title="Reçu"
                        className="h-full w-full border-0"
                      />
                    )}
                  </div>
                </div>,
                document.body
              )
            : (
          <DialogContent
            title="Reçu"
            onClose={() => setViewingReceipt(null)}
            className="flex h-[90vh] max-h-[90vh] max-w-4xl flex-col overflow-hidden"
          >
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setViewingReceipt(null)}
                >
                  <ArrowLeft className="h-4 w-4" /> Retour
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setReceiptFullscreen(true)}
                >
                  <Maximize2 className="h-4 w-4" /> Plein écran
                </Button>
              </div>
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900">
                {viewingReceipt.mimeType?.startsWith('image/') ? (
                  <img
                    src={viewingReceipt.url}
                    alt="Reçu"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <iframe
                    src={viewingReceipt.url}
                    title="Reçu"
                    className="h-full w-full border-0"
                  />
                )}
              </div>
            </div>
          </DialogContent>
            ))}
      </Dialog>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        <div className="overflow-hidden">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col style={{ width: '14%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '4%' }} />
            <col style={{ width: '4%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
          <thead className="sticky top-0 z-10 border-b-2 border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
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
                    className="px-2 py-3 text-slate-900 dark:text-slate-100"
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
