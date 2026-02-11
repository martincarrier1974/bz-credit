import { getToken } from './auth';

const API = '/api';

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const h: Record<string, string> = { ...extra };
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export type ExpenseQuery = {
  from?: string;
  to?: string;
  validated?: 'all' | 'true' | 'false';
  hasInvoice?: 'all' | 'true' | 'false';
  search?: string;
};

export async function fetchExpenses(params: ExpenseQuery) {
  const sp = new URLSearchParams();
  if (params.from) sp.set('from', params.from);
  if (params.to) sp.set('to', params.to);
  if (params.validated) sp.set('validated', params.validated);
  if (params.hasInvoice) sp.set('hasInvoice', params.hasInvoice);
  if (params.search) sp.set('search', params.search);
  const res = await fetch(`${API}/expenses?${sp}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createExpense(body: Record<string, unknown>) {
  const res = await fetch(`${API}/expenses`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message ?? err.error ?? await res.text());
  }
  return res.json();
}

export async function updateExpense(id: string, body: Record<string, unknown>) {
  const res = await fetch(`${API}/expenses/${id}`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message ?? err.error ?? await res.text());
  }
  return res.json();
}

export async function deleteExpense(id: string) {
  const res = await fetch(`${API}/expenses/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
}

export async function uploadReceipt(id: string, file: File): Promise<{ receiptPath: string }> {
  const form = new FormData();
  form.append('receipt', file);
  const res = await fetch(`${API}/expenses/${id}/receipt`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? await res.text());
  }
  return res.json();
}

export async function fetchMeta() {
  const res = await fetch(`${API}/meta`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export type Employee = { id: string; name: string; creditCards?: { id: string; name: string }[] };
export async function fetchEmployees(): Promise<Employee[]> {
  const res = await fetch(`${API}/employees`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function createEmployee(name: string) {
  const res = await fetch(`${API}/employees`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? await res.text());
  }
  return res.json();
}
export async function updateEmployee(id: string, name: string) {
  const res = await fetch(`${API}/employees/${id}`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? await res.text());
  }
  return res.json();
}
export async function deleteEmployee(id: string) {
  const res = await fetch(`${API}/employees/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
}

export type CreditCard = {
  id: string;
  name: string;
  cardNumber: string | null;
  type: string | null;
  expirationMonth: string | null;
  expirationYear: string | null;
  active: boolean;
  email: string | null;
  description: string | null;
  employeeId: string;
  employee: { id: string; name: string };
};
export async function fetchCreditCards(): Promise<CreditCard[]> {
  const res = await fetch(`${API}/credit-cards`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function createCreditCard(body: Record<string, unknown>) {
  const res = await fetch(`${API}/credit-cards`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? await res.text());
  }
  return res.json();
}
export async function updateCreditCard(id: string, body: Record<string, unknown>) {
  const res = await fetch(`${API}/credit-cards/${id}`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? await res.text());
  }
  return res.json();
}
export async function deleteCreditCard(id: string) {
  const res = await fetch(`${API}/credit-cards/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
}

export type GlAccount = {
  id: string;
  code: string;
  name: string;
  company?: string | null;
};
export async function fetchGlAccounts(): Promise<GlAccount[]> {
  const res = await fetch(`${API}/gl-accounts`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function createGlAccount(body: { code: string; name: string; company?: string }) {
  const res = await fetch(`${API}/gl-accounts`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? await res.text());
  }
  return res.json();
}
export async function deleteGlAccount(id: string) {
  const res = await fetch(`${API}/gl-accounts/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
}
