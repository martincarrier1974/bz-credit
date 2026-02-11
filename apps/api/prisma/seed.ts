import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const emp1 = await prisma.employee.upsert({
    where: { id: 'emp-1' },
    update: {},
    create: { id: 'emp-1', name: 'Marie Tremblay' },
  });
  const emp2 = await prisma.employee.upsert({
    where: { id: 'emp-2' },
    update: {},
    create: { id: 'emp-2', name: 'Jean Bouchard' },
  });
  const emp3 = await prisma.employee.upsert({
    where: { id: 'emp-3' },
    update: {},
    create: { id: 'emp-3', name: 'Sophie Gagnon' },
  });

  const sup1 = await prisma.supplier.upsert({
    where: { id: 'sup-1' },
    update: {},
    create: { id: 'sup-1', name: 'Amazon.ca' },
  });
  const sup2 = await prisma.supplier.upsert({
    where: { id: 'sup-2' },
    update: {},
    create: { id: 'sup-2', name: 'Staples' },
  });
  const sup3 = await prisma.supplier.upsert({
    where: { id: 'sup-3' },
    update: {},
    create: { id: 'sup-3', name: 'Costco' },
  });

  const cat1 = await prisma.category.upsert({
    where: { id: 'cat-1' },
    update: {},
    create: { id: 'cat-1', name: 'Bureau' },
  });
  const cat2 = await prisma.category.upsert({
    where: { id: 'cat-2' },
    update: {},
    create: { id: 'cat-2', name: 'Voyage' },
  });
  const cat3 = await prisma.category.upsert({
    where: { id: 'cat-3' },
    update: {},
    create: { id: 'cat-3', name: 'Fournitures' },
  });

  const gl1 = await prisma.glAccount.upsert({
    where: { id: 'gl-1' },
    update: {},
    create: { id: 'gl-1', code: '6100', name: 'Fournitures bureau' },
  });
  const gl2 = await prisma.glAccount.upsert({
    where: { id: 'gl-2' },
    update: {},
    create: { id: 'gl-2', code: '6200', name: 'Voyages et déplacements' },
  });
  const gl3 = await prisma.glAccount.upsert({
    where: { id: 'gl-3' },
    update: {},
    create: { id: 'gl-3', code: '6300', name: 'Frais généraux' },
  });

  const expenses = await prisma.expense.findMany();
  if (expenses.length > 0) {
    console.log('Seed déjà appliqué, skip.');
    return;
  }

  await prisma.expense.createMany({
    data: [
      {
        title: 'Clavier sans fil',
        description: 'Clavier Logitech K380',
        employeeId: emp1.id,
        supplierId: sup1.id,
        date: '2025-01-15',
        amount: 49.99,
        tps: 2.50,
        tvq: 4.87,
        categoryId: cat1.id,
        glAccountId: gl1.id,
        hasInvoice: true,
        validated: true,
      },
      {
        title: 'Hébergement conférence',
        employeeId: emp2.id,
        supplierId: sup3.id,
        date: '2025-01-20',
        amount: 320.0,
        tps: 16.0,
        tvq: 31.20,
        categoryId: cat2.id,
        glAccountId: gl2.id,
        hasInvoice: true,
        validated: false,
      },
      {
        title: 'Papier et enveloppes',
        description: 'Réappro bureau',
        employeeId: emp3.id,
        supplierId: sup2.id,
        date: '2025-02-01',
        amount: 85.5,
        tps: 4.28,
        tvq: 8.34,
        categoryId: cat3.id,
        glAccountId: gl1.id,
        hasInvoice: false,
        validated: false,
      },
    ],
  });
  console.log('Seed terminé.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
