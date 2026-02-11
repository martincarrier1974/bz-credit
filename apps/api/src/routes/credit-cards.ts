import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '../lib/encrypt.js';

const prisma = new PrismaClient();
export const creditCardsRouter = Router();

function decryptCard(card: { id: string; name: string; cardNumber: string | null; type: string | null; expirationMonth: string | null; expirationYear: string | null; active: boolean; csv: string | null; email: string | null; description: string | null; employeeId: string; employee: { id: string; name: string } }) {
  return {
    ...card,
    name: decrypt(card.name) ?? card.name,
    cardNumber: card.cardNumber ? (decrypt(card.cardNumber) ?? card.cardNumber) : null,
    type: card.type ? (decrypt(card.type) ?? card.type) : null,
    expirationMonth: card.expirationMonth ? (decrypt(card.expirationMonth) ?? card.expirationMonth) : null,
    expirationYear: card.expirationYear ? (decrypt(card.expirationYear) ?? card.expirationYear) : null,
    csv: card.csv ? (decrypt(card.csv) ?? card.csv) : null,
    email: card.email ? (decrypt(card.email) ?? card.email) : null,
    description: card.description ? (decrypt(card.description) ?? card.description) : null,
    employee: { ...card.employee, name: decrypt(card.employee.name) ?? card.employee.name },
  };
}

function sanitizeCard(card: { id: string; name: string; cardNumber: string | null; type: string | null; expirationMonth: string | null; expirationYear: string | null; active: boolean; csv: string | null; email: string | null; description: string | null; employeeId: string; employee: { id: string; name: string } }) {
  const d = decryptCard(card);
  return {
    id: d.id,
    name: d.name,
    cardNumber: d.cardNumber && d.cardNumber.length >= 4 ? '****' + d.cardNumber.slice(-4) : d.cardNumber,
    type: d.type,
    expirationMonth: d.expirationMonth,
    expirationYear: d.expirationYear,
    active: d.active,
    csv: d.csv ? '***' : null,
    email: d.email,
    description: d.description,
    employeeId: d.employeeId,
    employee: d.employee,
  };
}

creditCardsRouter.get('/', async (_req, res) => {
  try {
    const cards = await prisma.creditCard.findMany({
      include: { employee: true },
    });
    const decrypted = cards.map(sanitizeCard);
    decrypted.sort((a, b) => a.name.localeCompare(b.name));
    return res.json(decrypted);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

creditCardsRouter.post('/', async (req, res) => {
  try {
    const { name, cardNumber, type, expirationMonth, expirationYear, active, csv, email, description, employeeId } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Nom requis' });
    }
    if (!employeeId || typeof employeeId !== 'string') {
      return res.status(400).json({ error: 'Employé requis' });
    }
    const enc = (s: string | null) => (s ? (encrypt(s) ?? s) : null);
    const card = await prisma.creditCard.create({
      data: {
        name: enc(name.trim()) ?? name.trim(),
        cardNumber: enc(cardNumber && typeof cardNumber === 'string' ? cardNumber.trim() : null),
        type: enc(type && typeof type === 'string' ? type.trim() : null),
        expirationMonth: enc(expirationMonth != null ? String(expirationMonth) : null),
        expirationYear: enc(expirationYear != null ? String(expirationYear) : null),
        active: active !== false,
        csv: enc(csv && typeof csv === 'string' ? csv.trim() : null),
        email: enc(email && typeof email === 'string' ? email.trim() : null),
        description: enc(description && typeof description === 'string' ? description.trim() : null),
        employeeId,
      },
      include: { employee: true },
    });
    return res.status(201).json(sanitizeCard(card as Parameters<typeof sanitizeCard>[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

creditCardsRouter.put('/:id', async (req, res) => {
  try {
    const { name, cardNumber, type, expirationMonth, expirationYear, active, csv, email, description, employeeId } = req.body;
    const enc = (s: string | null) => (s ? (encrypt(s) ?? s) : null);
    const data: Record<string, unknown> = {};
    if (name != null) data.name = typeof name === 'string' ? enc(name.trim()) ?? name.trim() : name;
    if (cardNumber !== undefined) data.cardNumber = enc(cardNumber && typeof cardNumber === 'string' ? cardNumber.trim() : null);
    if (type !== undefined) data.type = enc(type && typeof type === 'string' ? type.trim() : null);
    if (expirationMonth !== undefined) data.expirationMonth = enc(expirationMonth != null ? String(expirationMonth) : null);
    if (expirationYear !== undefined) data.expirationYear = enc(expirationYear != null ? String(expirationYear) : null);
    if (active !== undefined) data.active = active !== false;
    if (csv !== undefined) data.csv = enc(csv && typeof csv === 'string' ? csv.trim() : null);
    if (email !== undefined) data.email = enc(email && typeof email === 'string' ? email.trim() : null);
    if (description !== undefined) data.description = enc(description && typeof description === 'string' ? description.trim() : null);
    if (employeeId != null) data.employeeId = employeeId;

    const card = await prisma.creditCard.update({
      where: { id: req.params.id },
      data,
      include: { employee: true },
    });
    return res.json(sanitizeCard(card));
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2025') {
      return res.status(404).json({ error: 'Carte non trouvée' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

creditCardsRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.creditCard.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2025') {
      return res.status(404).json({ error: 'Carte non trouvée' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
