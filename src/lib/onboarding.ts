import "server-only";

import { getPrisma } from "@/lib/prisma";

export const defaultExpenseCategories = [
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

let productionSchemaPromise: Promise<void> | null = null;

export async function ensureProductionSchemaCompatibility() {
  if (!productionSchemaPromise) {
    const prisma = getPrisma();

    productionSchemaPromise = (async () => {
      await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'OWNER'`);
      await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MEMBER'`);
    })();
  }

  await productionSchemaPromise;
}

export async function createStarterFamily(input: {
  name: string;
  email: string;
  passwordHash: string;
  familyName: string;
  spouseName?: string;
}) {
  await ensureProductionSchemaCompatibility();

  const prisma = getPrisma();
  const family = await prisma.family.create({ data: { name: input.familyName } });
  const ownerProfile = await prisma.familyMember.create({
    data: { familyId: family.id, name: input.name, label: "Responsavel", color: "#047857" },
  });
  const spouse = await prisma.familyMember.create({
    data: { familyId: family.id, name: input.spouseName || "Esposa", label: "Co-responsavel", color: "#2563eb" },
  });
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      role: "OWNER",
      familyId: family.id,
      profileId: ownerProfile.id,
    },
  });
  const incomeCategory = await prisma.category.create({
    data: { familyId: family.id, name: "Renda", type: "INCOME", color: "#047857", icon: "wallet" },
  });

  await prisma.category.createMany({
    data: defaultExpenseCategories.map(([name, color, icon]) => ({
      familyId: family.id,
      name,
      type: "EXPENSE" as const,
      color,
      icon,
    })),
  });

  await prisma.income.createMany({
    data: [
      {
        familyId: family.id,
        categoryId: incomeCategory.id,
        responsibleId: ownerProfile.id,
        description: "Rodrigo PJ",
        value: 5500,
        type: "FIXED",
        receivedAt: new Date(),
        recurring: true,
        status: "EXPECTED",
      },
      {
        familyId: family.id,
        categoryId: incomeCategory.id,
        responsibleId: spouse.id,
        description: "Bolsa Familia",
        value: 450,
        type: "FIXED",
        receivedAt: new Date(),
        recurring: true,
        status: "EXPECTED",
      },
    ],
  });

  return user;
}
