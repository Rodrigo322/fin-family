import "server-only";

import { addMonths } from "@/lib/format";
import { getPrisma } from "@/lib/prisma";

export async function getFamilyLookups(familyId: string) {
  const prisma = getPrisma();
  const [members, categories, cards] = await Promise.all([
    prisma.familyMember.findMany({ where: { familyId }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { familyId }, orderBy: [{ type: "asc" }, { name: "asc" }] }),
    prisma.creditCard.findMany({ where: { familyId, active: true }, orderBy: { name: "asc" } }),
  ]);

  return { members, categories, cards };
}

export async function getDashboardData(familyId: string) {
  const prisma = getPrisma();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [incomes, expenses, bills, invoices, categories] = await Promise.all([
    prisma.income.findMany({
      where: { familyId, receivedAt: { gte: monthStart, lte: monthEnd } },
      include: { responsible: true },
      orderBy: { receivedAt: "desc" },
    }),
    prisma.expense.findMany({
      where: { familyId, spentAt: { gte: monthStart, lte: monthEnd } },
      include: { category: true, responsible: true, card: true },
      orderBy: { spentAt: "desc" },
      take: 8,
    }),
    prisma.bill.findMany({
      where: { familyId, dueDate: { lte: addMonths(now, 2) } },
      include: { category: true, responsible: true },
      orderBy: { dueDate: "asc" },
      take: 8,
    }),
    prisma.invoice.findMany({
      where: { familyId, dueDate: { gte: monthStart, lte: addMonths(now, 3) } },
      include: { card: true },
      orderBy: { dueDate: "asc" },
      take: 6,
    }),
    prisma.category.findMany({
      where: { familyId, type: "EXPENSE" },
      include: { expenses: { where: { spentAt: { gte: monthStart, lte: monthEnd } } } },
    }),
  ]);

  const incomeTotal = incomes.reduce((sum, item) => sum + Number(item.value), 0);
  const creditTotal = expenses
    .filter((item) => item.paymentMethod === "CREDIT")
    .reduce((sum, item) => sum + Number(item.value), 0);
  const debitTotal = expenses
    .filter((item) => item.paymentMethod !== "CREDIT")
    .reduce((sum, item) => sum + Number(item.value), 0);
  const pendingBills = bills.filter((item) => item.status === "PENDING");
  const overdueBills = bills.filter((item) => item.status === "OVERDUE");
  const categoryChart = categories
    .map((category) => ({
      name: category.name,
      value: category.expenses.reduce((sum, item) => sum + Number(item.value), 0),
      fill: category.color,
    }))
    .filter((item) => item.value > 0);

  return {
    incomeTotal,
    creditTotal,
    debitTotal,
    pendingBillsTotal: pendingBills.reduce((sum, item) => sum + Number(item.value), 0),
    overdueBillsTotal: overdueBills.reduce((sum, item) => sum + Number(item.value), 0),
    balance: incomeTotal - creditTotal - debitTotal - pendingBills.reduce((sum, item) => sum + Number(item.value), 0),
    expenses,
    bills,
    invoices,
    categoryChart,
    methodChart: [
      { name: "Credito", value: creditTotal, fill: "#2563eb" },
      { name: "Debito/Pix/Dinheiro", value: debitTotal, fill: "#047857" },
    ].filter((item) => item.value > 0),
  };
}

export async function getExpenses(familyId: string) {
  return getPrisma().expense.findMany({
    where: { familyId },
    include: { category: true, responsible: true, createdBy: true, card: true, invoice: true },
    orderBy: { spentAt: "desc" },
  });
}

export async function getIncomes(familyId: string) {
  return getPrisma().income.findMany({
    where: { familyId },
    include: { responsible: true },
    orderBy: { receivedAt: "desc" },
  });
}

export async function getCards(familyId: string) {
  return getPrisma().creditCard.findMany({
    where: { familyId },
    include: {
      owner: true,
      expenses: true,
      invoices: { orderBy: { dueDate: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvoices(familyId: string) {
  return getPrisma().invoice.findMany({
    where: { familyId },
    include: { card: true, expenses: { include: { category: true, responsible: true } } },
    orderBy: { dueDate: "asc" },
  });
}

export async function getBills(familyId: string) {
  return getPrisma().bill.findMany({
    where: { familyId },
    include: { category: true, responsible: true },
    orderBy: { dueDate: "asc" },
  });
}

export async function getUpcoming(familyId: string) {
  const prisma = getPrisma();
  const now = new Date();
  const end = addMonths(now, 4);

  const [bills, expenses, invoices] = await Promise.all([
    prisma.bill.findMany({
      where: { familyId, dueDate: { gte: now, lte: end } },
      include: { category: true, responsible: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.expense.findMany({
      where: {
        familyId,
        spentAt: { gte: now, lte: end },
        installmentsCount: { gt: 1 },
      },
      include: { category: true, responsible: true, card: true },
      orderBy: { spentAt: "asc" },
    }),
    prisma.invoice.findMany({
      where: { familyId, dueDate: { gte: now, lte: end } },
      include: { card: true },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  return { bills, expenses, invoices };
}

export async function getCategories(familyId: string) {
  return getPrisma().category.findMany({
    where: { familyId },
    include: { expenses: true, incomes: true, bills: true },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}

export async function getFamilyOverview(familyId: string) {
  const prisma = getPrisma();
  const [members, expenses, incomes] = await Promise.all([
    prisma.familyMember.findMany({ where: { familyId }, orderBy: { name: "asc" } }),
    prisma.expense.findMany({ where: { familyId }, include: { responsible: true, category: true } }),
    prisma.income.findMany({ where: { familyId }, include: { responsible: true } }),
  ]);

  return { members, expenses, incomes };
}
