import "dotenv/config";

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const expenseCategories = [
  ["Mercado", "#059669", "shopping-cart"],
  ["Combustivel", "#2563eb", "fuel"],
  ["Saude", "#dc2626", "heart-pulse"],
  ["Farmacia", "#7c3aed", "cross"],
  ["Alimentacao", "#0f766e", "utensils"],
  ["Casa", "#4f46e5", "home"],
  ["Criancas", "#0891b2", "smile"],
  ["Transporte", "#0ea5e9", "bus"],
  ["Lazer", "#9333ea", "ticket"],
  ["Dividas", "#b91c1c", "receipt"],
  ["Educacao", "#475569", "graduation-cap"],
  ["Internet", "#0284c7", "wifi"],
  ["Energia", "#ca8a04", "zap"],
  ["Agua", "#06b6d4", "droplets"],
  ["Outros", "#64748b", "circle"],
] as const;

async function main() {
  const passwordHash = await hash("controle123", 12);

  await prisma.family.deleteMany({
    where: { id: "seed-family-controle-familiar" },
  });

  const family = await prisma.family.create({
    data: {
      id: "seed-family-controle-familiar",
      name: "Familia Rodrigo",
    },
  });

  const rodrigo = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      name: "Rodrigo",
      label: "PJ",
      color: "#047857",
    },
  });

  const esposa = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      name: "Esposa",
      label: "Bolsa Familia",
      color: "#2563eb",
    },
  });

  await prisma.user.upsert({
    where: { email: "rodrigo@controle.local" },
    update: {
      name: "Rodrigo",
      passwordHash,
      role: "OWNER",
      familyId: family.id,
      profileId: rodrigo.id,
    },
    create: {
      name: "Rodrigo",
      email: "rodrigo@controle.local",
      passwordHash,
      role: "OWNER",
      familyId: family.id,
      profileId: rodrigo.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "esposa@controle.local" },
    update: {
      name: "Esposa",
      passwordHash,
      role: "MEMBER",
      familyId: family.id,
      profileId: esposa.id,
    },
    create: {
      name: "Esposa",
      email: "esposa@controle.local",
      passwordHash,
      role: "MEMBER",
      familyId: family.id,
      profileId: esposa.id,
    },
  });

  const incomeCategory = await prisma.category.upsert({
    where: { familyId_name_type: { familyId: family.id, name: "Renda", type: "INCOME" } },
    update: {},
    create: {
      familyId: family.id,
      name: "Renda",
      type: "INCOME",
      color: "#047857",
      icon: "wallet",
    },
  });

  for (const [name, color, icon] of expenseCategories) {
    await prisma.category.upsert({
      where: { familyId_name_type: { familyId: family.id, name, type: "EXPENSE" } },
      update: { color, icon },
      create: { familyId: family.id, name, type: "EXPENSE", color, icon },
    });
  }

  await prisma.income.createMany({
    data: [
      {
        familyId: family.id,
        categoryId: incomeCategory.id,
        responsibleId: rodrigo.id,
        description: "Rodrigo PJ",
        value: 5500,
        type: "FIXED",
        receivedAt: new Date("2026-05-05T12:00:00.000Z"),
        recurring: true,
        status: "EXPECTED",
      },
      {
        familyId: family.id,
        categoryId: incomeCategory.id,
        responsibleId: esposa.id,
        description: "Bolsa Familia",
        value: 450,
        type: "FIXED",
        receivedAt: new Date("2026-05-18T12:00:00.000Z"),
        recurring: true,
        status: "EXPECTED",
      },
    ],
    skipDuplicates: true,
  });

  const mercado = await prisma.category.findFirstOrThrow({
    where: { familyId: family.id, name: "Mercado", type: "EXPENSE" },
  });
  const internet = await prisma.category.findFirstOrThrow({
    where: { familyId: family.id, name: "Internet", type: "EXPENSE" },
  });
  const casa = await prisma.category.findFirstOrThrow({
    where: { familyId: family.id, name: "Casa", type: "EXPENSE" },
  });

  const card = await prisma.creditCard.upsert({
    where: { familyId_name: { familyId: family.id, name: "Nubank Platinum" } },
    update: {},
    create: {
      familyId: family.id,
      ownerId: esposa.id,
      name: "Nubank Platinum",
      bank: "Nubank",
      limitTotal: 12000,
      dueDay: 15,
      closingDay: 8,
      bestPurchaseDay: 9,
      active: true,
    },
  });

  const user = await prisma.user.findUniqueOrThrow({ where: { email: "rodrigo@controle.local" } });

  await prisma.bill.createMany({
    data: [
      {
        familyId: family.id,
        responsibleId: rodrigo.id,
        categoryId: casa.id,
        name: "Aluguel do apartamento",
        value: 2800,
        dueDate: new Date("2026-05-05T12:00:00.000Z"),
        recurring: true,
        frequency: "MONTHLY",
        status: "PAID",
      },
      {
        familyId: family.id,
        responsibleId: rodrigo.id,
        categoryId: internet.id,
        name: "Internet fibra",
        value: 149.9,
        dueDate: new Date("2026-05-20T12:00:00.000Z"),
        recurring: true,
        frequency: "MONTHLY",
        status: "PENDING",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.expense.createMany({
    data: [
      {
        familyId: family.id,
        categoryId: mercado.id,
        responsibleId: rodrigo.id,
        createdById: user.id,
        description: "Supermercado Silva",
        value: 342.5,
        spentAt: new Date("2026-05-16T16:00:00.000Z"),
        paymentMethod: "DEBIT",
        shared: true,
        status: "PAID",
      },
      {
        familyId: family.id,
        categoryId: mercado.id,
        responsibleId: esposa.id,
        createdById: user.id,
        description: "Compra parcelada mercado",
        value: 210,
        spentAt: new Date("2026-05-10T16:00:00.000Z"),
        paymentMethod: "CREDIT",
        cardId: card.id,
        shared: true,
        installmentsCount: 3,
        installmentNumber: 1,
        installmentGroupId: "seed-installment-mercado",
        status: "PENDING",
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
