export interface Employee {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface GlAccount {
  id: string;
  code: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  title: string;
  description: string | null;
  employeeId: string;
  employee: Employee;
  supplierId: string;
  supplier: Supplier;
  date: string;
  amount: number;
  tps: number;
  tvq: number;
  total: number;
  categoryId: string;
  category: Category;
  glAccountId: string;
  glAccount: GlAccount;
  hasInvoice: boolean;
  validated: boolean;
  receiptPath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Meta {
  employees: Employee[];
  categories: Category[];
  glAccounts: GlAccount[];
  suppliers: Supplier[];
}

export interface ExpenseTotals {
  amount: number;
  tps: number;
  tvq: number;
  total: number;
}
