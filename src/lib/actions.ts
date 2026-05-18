"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSession, destroySession, hashPassword, requireUser, verifyPassword } from "@/lib/auth";
import { addMonths, clampDay } from "@/lib/format";
import { getPrisma } from "@/lib/prisma";
import {
  billSchema,
  cardSchema,
  categorySchema,
  expenseSchema,
  incomeSchema,
  loginSchema,
  memberSchema,
  registerSchema,
} from "@/lib/validations";

const defaultCategories = [
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

function formObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function hasCheckbox(formData: FormData, name: string) {
  return formData.get(name) === "on" || formData.get(name) === "true";
}

async function ensureExpenseCategory(familyId: string) {
  const prisma = getPrisma();
  const category = await prisma.category.findFirst({
    where: { familyId, type: "EXPENSE" },
    orderBy: { name: "asc" },
  });

  if (!category) {
    throw new Error("Cadastre ao menos uma categoria de despesa.");
  }

  return category;
}

function invoiceDates(card: { closingDay: number; dueDay: number }, spentAt: Date, offset = 0) {
  const reference = addMonths(spentAt, spentAt.getDate() > card.closingDay ? 1 + offset : offset);
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const closingDate = new Date(year, month, clampDay(year, month, card.closingDay));
  const dueDate = new Date(year, month, clampDay(year, month, card.dueDay));
  const referenceMonth = new Date(year, month, 1);

  return { referenceMonth, closingDate, dueDate };
}

async function getOrCreateInvoice(cardId: string, familyId: string, spentAt: Date, offset = 0) {
  const prisma = getPrisma();
  const card = await prisma.creditCard.findFirstOrThrow({
    where: { id: cardId, familyId },
  });
  const dates = invoiceDates(card, spentAt, offset);

  return prisma.invoice.upsert({
    where: {
      cardId_referenceMonth: {
        cardId,
        referenceMonth: dates.referenceMonth,
      },
    },
    update: {},
    create: {
      familyId,
      cardId,
      ...dates,
    },
  });
}

async function refreshApp() {
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  revalidatePath("/incomes");
  revalidatePath("/credit-cards");
  revalidatePath("/invoices");
  revalidatePath("/bills");
  revalidatePath("/upcoming");
  revalidatePath("/categories");
  revalidatePath("/family");
  revalidatePath("/reports");
}

export async function loginAction(formData: FormData) {
  const data = loginSchema.parse(formObject(formData));
  const user = await getPrisma().user.findUnique({ where: { email: data.email.toLowerCase() } });

  if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
    redirect("/login?error=invalid");
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
  const data = registerSchema.parse(formObject(formData));
  const prisma = getPrisma();

  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) {
    redirect("/register?error=exists");
  }

  const passwordHash = await hashPassword(data.password);
  const family = await prisma.family.create({ data: { name: data.familyName } });
  const rodrigo = await prisma.familyMember.create({
    data: { familyId: family.id, name: data.name, label: "Responsavel", color: "#047857" },
  });
  const spouse = await prisma.familyMember.create({
    data: { familyId: family.id, name: data.spouseName || "Esposa", label: "Co-responsavel", color: "#2563eb" },
  });
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: "OWNER",
      familyId: family.id,
      profileId: rodrigo.id,
    },
  });
  const incomeCategory = await prisma.category.create({
    data: { familyId: family.id, name: "Renda", type: "INCOME", color: "#047857", icon: "wallet" },
  });

  await prisma.category.createMany({
    data: defaultCategories.map(([name, color, icon]) => ({
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
        responsibleId: rodrigo.id,
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

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function createExpenseAction(input: unknown) {
  const user = await requireUser();
  const data = expenseSchema.parse(input);
  const prisma = getPrisma();
  const familyId = user.familyId;
  const installments = data.paymentMethod === "CREDIT" ? data.installmentsCount : 1;
  const groupId = installments > 1 ? randomUUID() : undefined;
  const installmentValue = Number((data.value / installments).toFixed(2));
  const creates = [];

  for (let index = 0; index < installments; index += 1) {
    const spentAt = data.paymentMethod === "CREDIT" ? addMonths(data.spentAt, index) : data.spentAt;
    const invoice = data.paymentMethod === "CREDIT" && data.cardId
      ? await getOrCreateInvoice(data.cardId, familyId, data.spentAt, index)
      : null;

    creates.push(
      prisma.expense.create({
        data: {
          familyId,
          description: installments > 1 ? `${data.description} (${index + 1}/${installments})` : data.description,
          value: installmentValue,
          spentAt,
          categoryId: data.categoryId,
          paymentMethod: data.paymentMethod,
          responsibleId: data.responsibleId,
          createdById: user.id,
          shared: data.shared,
          notes: data.notes,
          cardId: data.paymentMethod === "CREDIT" ? data.cardId : null,
          invoiceId: invoice?.id,
          installmentsCount: installments,
          installmentNumber: index + 1,
          installmentGroupId: groupId,
          status: data.paymentMethod === "CREDIT" ? "PENDING" : "PAID",
        },
      }),
    );
  }

  await prisma.$transaction(creates);

  if (data.paymentMethod === "CREDIT") {
    const invoices = await prisma.invoice.findMany({
      where: { familyId, cardId: data.cardId },
      include: { expenses: true },
    });

    await Promise.all(
      invoices.map((invoice) =>
        prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            totalValue: invoice.expenses.reduce((sum, item) => sum + Number(item.value), 0),
          },
        }),
      ),
    );
  }

  await refreshApp();
}

export async function createIncomeAction(formData: FormData) {
  const user = await requireUser();
  const data = incomeSchema.parse({ ...formObject(formData), recurring: hasCheckbox(formData, "recurring") });
  const category = await getPrisma().category.findFirst({
    where: { familyId: user.familyId, type: "INCOME" },
  });

  await getPrisma().income.create({
    data: {
      familyId: user.familyId,
      categoryId: category?.id,
      ...data,
    },
  });
  await refreshApp();
}

export async function createCardAction(formData: FormData) {
  const user = await requireUser();
  const data = cardSchema.parse({ ...formObject(formData), active: hasCheckbox(formData, "active") });
  await getPrisma().creditCard.create({ data: { familyId: user.familyId, ...data } });
  await refreshApp();
}

export async function createBillAction(formData: FormData) {
  const user = await requireUser();
  const data = billSchema.parse({ ...formObject(formData), recurring: hasCheckbox(formData, "recurring") });
  await getPrisma().bill.create({
    data: {
      familyId: user.familyId,
      ...data,
      frequency: data.frequency || null,
    },
  });
  await refreshApp();
}

export async function updateBillAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const data = billSchema.parse({ ...formObject(formData), recurring: hasCheckbox(formData, "recurring") });

  await getPrisma().bill.updateMany({
    where: { id, familyId: user.familyId },
    data: {
      ...data,
      frequency: data.frequency || null,
    },
  });

  await refreshApp();
}

export async function createCategoryAction(formData: FormData) {
  const user = await requireUser();
  const data = categorySchema.parse(formObject(formData));
  await getPrisma().category.create({ data: { familyId: user.familyId, ...data } });
  await refreshApp();
}

export async function createMemberAction(formData: FormData) {
  const user = await requireUser();
  const data = memberSchema.parse(formObject(formData));
  await getPrisma().familyMember.create({ data: { familyId: user.familyId, ...data } });
  await refreshApp();
}

export async function updateMemberAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const data = memberSchema.parse(formObject(formData));

  await getPrisma().familyMember.updateMany({
    where: { id, familyId: user.familyId },
    data,
  });

  await refreshApp();
}

export async function deleteExpenseAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const mode = String(formData.get("mode") || "single");
  const expense = await getPrisma().expense.findFirstOrThrow({ where: { id, familyId: user.familyId } });

  if (mode === "all" && expense.installmentGroupId) {
    await getPrisma().expense.deleteMany({
      where: { familyId: user.familyId, installmentGroupId: expense.installmentGroupId },
    });
  } else {
    await getPrisma().expense.delete({ where: { id } });
  }

  await refreshApp();
}

export async function deleteEntityAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const entity = String(formData.get("entity"));
  const prisma = getPrisma();

  if (entity === "income") await prisma.income.deleteMany({ where: { id, familyId: user.familyId } });
  if (entity === "bill") await prisma.bill.deleteMany({ where: { id, familyId: user.familyId } });

  if (entity === "card") {
    const linkedRecords = await prisma.expense.count({ where: { familyId: user.familyId, cardId: id } })
      + await prisma.invoice.count({ where: { familyId: user.familyId, cardId: id } });

    if (linkedRecords > 0) {
      await prisma.creditCard.updateMany({
        where: { id, familyId: user.familyId },
        data: { active: false },
      });
    } else {
      await prisma.creditCard.deleteMany({ where: { id, familyId: user.familyId } });
    }
  }

  if (entity === "category") {
    const linkedRecords = await prisma.income.count({ where: { familyId: user.familyId, categoryId: id } })
      + await prisma.expense.count({ where: { familyId: user.familyId, categoryId: id } })
      + await prisma.bill.count({ where: { familyId: user.familyId, categoryId: id } });

    if (linkedRecords === 0) {
      await prisma.category.deleteMany({ where: { id, familyId: user.familyId } });
    }
  }

  if (entity === "member") {
    const linkedRecords = await prisma.income.count({ where: { familyId: user.familyId, responsibleId: id } })
      + await prisma.expense.count({ where: { familyId: user.familyId, responsibleId: id } })
      + await prisma.bill.count({ where: { familyId: user.familyId, responsibleId: id } })
      + await prisma.creditCard.count({ where: { familyId: user.familyId, ownerId: id } });

    if (linkedRecords === 0) {
      await prisma.familyMember.deleteMany({ where: { id, familyId: user.familyId } });
    }
  }

  await refreshApp();
}

export async function markInvoicePaidAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const invoice = await getPrisma().invoice.findFirstOrThrow({ where: { id, familyId: user.familyId } });

  await getPrisma().$transaction([
    getPrisma().invoice.update({ where: { id: invoice.id }, data: { status: "PAID" } }),
    getPrisma().expense.updateMany({
      where: { invoiceId: invoice.id, familyId: user.familyId },
      data: { status: "PAID" },
    }),
  ]);

  await refreshApp();
}

export async function markBillPaidAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await getPrisma().bill.updateMany({
    where: { id, familyId: user.familyId },
    data: { status: "PAID" },
  });
  await refreshApp();
}

export async function quickExpenseAction(formData: FormData) {
  const user = await requireUser();
  const category = await ensureExpenseCategory(user.familyId);
  const responsibleId = String(formData.get("responsibleId") || user.profileId);

  await createExpenseAction({
    description: String(formData.get("description") || "Gasto rapido"),
    value: Number(formData.get("value") || 0),
    spentAt: new Date(),
    categoryId: category.id,
    paymentMethod: "DEBIT",
    responsibleId,
    shared: true,
    installmentsCount: 1,
  });
}
