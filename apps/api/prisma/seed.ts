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

  const glAccountsBZ = [
    { id: 'gl-1', code: '7405', name: 'BZ Cadeaux/Commandite', company: 'BZ inc.' },
    { id: 'gl-2', code: '7590', name: 'BZ Formation', company: 'BZ inc.' },
    { id: 'gl-3', code: '160001', name: 'Aménagement et mobilier de bureau', company: 'BZ inc.' },
    { id: 'gl-4', code: '160002', name: 'Aménagement et mobilier de bureau', company: 'BZ inc.' },
    { id: 'gl-5', code: '160003', name: 'Aménagement et mobilier de bureau', company: 'BZ inc.' },
    { id: 'gl-6', code: '160004', name: 'Aménagement et mobilier de bureau', company: 'BZ inc.' },
    { id: 'gl-7', code: '160005', name: 'Aménagement et mobilier de bureau', company: 'BZ inc.' },
    { id: 'gl-8', code: '160006', name: 'Aménagement et mobilier de bureau', company: 'BZ inc.' },
    { id: 'gl-9', code: '160007', name: 'Aménagement et mobilier de bureau', company: 'BZ inc.' },
    { id: 'gl-10', code: '160008', name: 'Aménagement et mobilier de bureau', company: 'BZ inc.' },
    { id: 'gl-11', code: '160009', name: 'Aménagement et mobilier de bureau', company: 'BZ inc.' },
    { id: 'gl-12', code: '160010', name: 'Aménagement et mobilier de bureau', company: 'BZ inc.' },
    { id: 'gl-13', code: '170001', name: 'Équipement Informatique Divers - Clc', company: 'BZ inc.' },
    { id: 'gl-14', code: '170002', name: 'Équipement Informatique Divers - Ser', company: 'BZ inc.' },
    { id: 'gl-15', code: '170003', name: 'Équipement Informatique Divers - Infi', company: 'BZ inc.' },
    { id: 'gl-16', code: '170004', name: 'Équipement Informatique Divers - Cyl', company: 'BZ inc.' },
    { id: 'gl-17', code: '170005', name: 'Équipement Informatique Divers - Prc', company: 'BZ inc.' },
    { id: 'gl-18', code: '170006', name: 'Équipement Informatique Divers - Ver', company: 'BZ inc.' },
  ];
  const glAccountsBZT = [
    { id: 'gl-19', code: '5000', name: 'BZT Achat', company: 'BZ Telecom inc.' },
    { id: 'gl-20', code: '5100', name: 'BZT Lait', company: 'BZ Telecom inc.' },
    { id: 'gl-21', code: '5140', name: 'BZT Essence', company: 'BZ Telecom inc.' },
    { id: 'gl-22', code: '5355', name: 'BZT Telephone', company: 'BZ Telecom inc.' },
    { id: 'gl-23', code: '5300', name: 'BZT Fournitures divers', company: 'BZ Telecom inc.' },
    { id: 'gl-24', code: '5341', name: 'BZT Frais Rep', company: 'BZ Telecom inc.' },
    { id: 'gl-25', code: '5420', name: 'BZT Voiture', company: 'BZ Telecom inc.' },
    { id: 'gl-26', code: '5340', name: 'BZT Papeterie Matériel de bureau', company: 'BZ Telecom inc.' },
    { id: 'gl-27', code: '7390', name: 'BZT Repas', company: 'BZ Telecom inc.' },
    { id: 'gl-28', code: '5030', name: 'BZT Site Web', company: 'BZ Telecom inc.' },
    { id: 'gl-29', code: '5330', name: 'BZ Transport/Douanes', company: 'BZ Telecom inc.' },
    { id: 'gl-30', code: '5333', name: 'BZ Transport/Douanes', company: 'BZ Telecom inc.' },
    { id: 'gl-31', code: '5480', name: 'BZ Nourriture-Bien être employé', company: 'BZ Telecom inc.' },
    { id: 'gl-32', code: '7350', name: 'BZT Publicité, commandite, cadeau', company: 'BZ Telecom inc.' },
    { id: 'gl-33', code: '7360', name: 'BZT-Fête et Évènement de Bureau', company: 'BZ Telecom inc.' },
    { id: 'gl-34', code: '7590', name: 'BZT-Formation', company: 'BZ Telecom inc.' },
  ];
  for (const g of [...glAccountsBZ, ...glAccountsBZT]) {
    await prisma.glAccount.upsert({
      where: { id: g.id },
      update: { code: g.code, name: g.name, company: g.company },
      create: g,
    });
  }
  const gl1 = await prisma.glAccount.findUniqueOrThrow({ where: { id: 'gl-1' } });
  const gl2 = await prisma.glAccount.findUniqueOrThrow({ where: { id: 'gl-2' } });
  const gl3 = await prisma.glAccount.findUniqueOrThrow({ where: { id: 'gl-3' } });

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
