import 'dotenv/config';
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { expensesRouter } from './routes/expenses.js';
import { metaRouter } from './routes/meta.js';
import { employeesRouter } from './routes/employees.js';
import { creditCardsRouter } from './routes/credit-cards.js';
import { glAccountsRouter } from './routes/gl-accounts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/expenses', expensesRouter);
app.use('/api/meta', metaRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/credit-cards', creditCardsRouter);
app.use('/api/gl-accounts', glAccountsRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
