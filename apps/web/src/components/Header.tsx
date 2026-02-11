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
      <div className="mx-auto flex h-16 max-w-full items-center justify-between px-2 py-4 sm:px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {!bzFailed ? (
              <img
                src="/bz.png"
                alt="BZ"
                className="h-11 w-auto object-contain"
                onError={() => setBzFailed(true)}
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-white text-base font-bold dark:bg-slate-700">
                BZ
              </div>
            )}
          </div>
          <span className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Factures carte de crédit
          </span>
        </div>
        <div className="flex items-center gap-2">
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
            className="h-11 rounded-lg px-5 text-base font-medium"
          >
            <Plus className="mr-2 h-5 w-5" />
            Nouvelle facture
          </Button>
        </div>
      </div>
    </header>
  );
}
