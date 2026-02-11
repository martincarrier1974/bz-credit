import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Moon, Sun, Users, CreditCard, BookOpen, LogOut } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

type Props = {
  onLogout: () => void;
  onAddExpense: () => void;
  onOpenEmployés: () => void;
  onOpenCartes: () => void;
  onOpenGL: () => void;
};

export function Header({ onLogout, onAddExpense, onOpenEmployés, onOpenCartes, onOpenGL }: Props) {
  const [bzFailed, setBzFailed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80">
      <div className="mx-auto flex max-w-full flex-col gap-3 px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-4">
        <div className="flex min-w-0 shrink-0 items-center gap-3">
          {!bzFailed ? (
            <img
              src="/bz.png"
              alt="BZ"
              className="h-9 w-auto shrink-0 object-contain sm:h-11"
              onError={() => setBzFailed(true)}
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white text-sm font-bold dark:bg-slate-700 sm:h-11 sm:w-11">
              BZ
            </div>
          )}
          <span className="truncate text-base font-semibold text-slate-900 dark:text-slate-50 sm:text-xl">
            Factures carte de crédit
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenEmployés}
            title="Gestion employés"
            className="h-11 gap-2 text-slate-600 dark:text-slate-400"
          >
            <Users className="h-5 w-5" />
            <span className="hidden sm:inline">Employés</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenGL}
            title="Départements grand livre"
            className="h-11 gap-2 text-slate-600 dark:text-slate-400"
          >
            <BookOpen className="h-5 w-5" />
            <span className="hidden sm:inline">GL</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenCartes}
            title="Gestion cartes de crédit"
            className="h-11 gap-2 text-slate-600 dark:text-slate-400"
          >
            <CreditCard className="h-5 w-5" />
            <span className="hidden sm:inline">Cartes</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            title="Déconnexion"
            className="h-11 w-11 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            <LogOut className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            className="h-11 w-11 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button
            onClick={onAddExpense}
            className="h-9 shrink-0 rounded-lg px-3 text-sm font-medium sm:h-11 sm:px-5 sm:text-base"
          >
            <Plus className="h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
            <span className="ml-1.5 sm:ml-0">Nouvelle facture</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
