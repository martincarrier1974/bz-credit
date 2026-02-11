import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const creditCardsRouter = Router();

function sanitizeCard(card: { id: string; name: string; cardNumber: string | null; type: string | null; expirationMonth: string | null; expirationYear: string | null; active: boolean; csv: string | null; email: string | null; description: string | null; employeeId: string; employee: { id: string; name: string } }) {
  return {
    id: card.id,
    name: card.name,
    cardNumber: card.cardNumber && card.cardNumber.length >= 4 ? '****' + card.cardNumber.slice(-4) : card.cardNumber,
    type: card.type,
    expirationMonth: card.expirationMonth,
    expirationYear: card.expirationYear,
    active: card.active,
    csv: card.csv ? '***' : null,
    email: card.email,
    description: card.description,
    employeeId: card.employeeId,
    employee: card.employee,
  };
}

creditCardsRouter.get('/', async (_req, res) => {
  try {
    const cards = await prisma.creditCard.findMany({
      include: { employee: true },
      orderBy: { name: 'asc' },
    });
    return res.json(cards.map(sanitizeCard));
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
    const card = await prisma.creditCard.create({
      data: {
        name: name.trim(),
        cardNumber: cardNumber && typeof cardNumber === 'string' ? cardNumber.trim() : null,
        type: type && typeof type === 'string' ? type.trim() : null,
        expirationMonth: expirationMonth != null ? String(expirationMonth) : null,
        expirationYear: expirationYear != null ? String(expirationYear) : null,
        active: active !== false,
        csv: csv && typeof csv === 'string' ? csv.trim() : null,
        email: email && typeof email === 'string' ? email.trim() : null,
        description: description && typeof description === 'string' ? description.trim() : null,
        employeeId,
      },
      include: { employee: true },
    });
    return res.status(201).json(sanitizeCard(card));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

creditCardsRouter.put('/:id', async (req, res) => {
  try {
    const { name, cardNumber, type, expirationMonth, expirationYear, active, csv, email, description, employeeId } = req.body;
    const data: Record<string, unknown> = {};
    if (name != null) data.name = typeof name === 'string' ? name.trim() : name;
    if (cardNumber !== undefined) data.cardNumber = cardNumber && typeof cardNumber === 'string' ? cardNumber.trim() : null;
    if (type !== undefined) data.type = type && typeof type === 'string' ? type.trim() : null;
    if (expirationMonth !== undefined) data.expirationMonth = expirationMonth != null ? String(expirationMonth) : null;
    if (expirationYear !== undefined) data.expirationYear = expirationYear != null ? String(expirationYear) : null;
    if (active !== undefined) data.active = active !== false;
    if (csv !== undefined) data.csv = csv && typeof csv === 'string' ? csv.trim() : null;
    if (email !== undefined) data.email = email && typeof email === 'string' ? email.trim() : null;
    if (description !== undefined) data.description = description && typeof description === 'string' ? description.trim() : null;
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
