import { NextRequest, NextResponse } from "next/server";

import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statements = [
  `DO $$ BEGIN CREATE TYPE "UserRole" AS ENUM ('OWNER', 'MEMBER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE "IncomeType" AS ENUM ('FIXED', 'VARIABLE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE "IncomeStatus" AS ENUM ('EXPECTED', 'RECEIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE "PaymentMethod" AS ENUM ('DEBIT', 'CREDIT', 'PIX', 'CASH'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE "InvoiceStatus" AS ENUM ('OPEN', 'CLOSED', 'PAID', 'OVERDUE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE "BillStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN CREATE TYPE "Frequency" AS ENUM ('MONTHLY', 'WEEKLY', 'YEARLY'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

  `CREATE TABLE IF NOT EXISTS "Family" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Family_pkey" PRIMARY KEY ("id"));`,
  `CREATE TABLE IF NOT EXISTS "FamilyMember" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "label" TEXT, "color" TEXT NOT NULL DEFAULT '#047857', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "familyId" TEXT NOT NULL, CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id"));`,
  `CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL, "role" "UserRole" NOT NULL DEFAULT 'MEMBER', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "familyId" TEXT NOT NULL, "profileId" TEXT, CONSTRAINT "User_pkey" PRIMARY KEY ("id"));`,
  `CREATE TABLE IF NOT EXISTS "Session" ("id" TEXT NOT NULL, "token" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "userId" TEXT NOT NULL, CONSTRAINT "Session_pkey" PRIMARY KEY ("id"));`,
  `CREATE TABLE IF NOT EXISTS "Category" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "type" "CategoryType" NOT NULL, "color" TEXT NOT NULL, "icon" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "familyId" TEXT NOT NULL, CONSTRAINT "Category_pkey" PRIMARY KEY ("id"));`,
  `CREATE TABLE IF NOT EXISTS "Income" ("id" TEXT NOT NULL, "description" TEXT NOT NULL, "value" DECIMAL(12,2) NOT NULL, "type" "IncomeType" NOT NULL, "receivedAt" TIMESTAMP(3) NOT NULL, "recurring" BOOLEAN NOT NULL DEFAULT true, "status" "IncomeStatus" NOT NULL DEFAULT 'EXPECTED', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "familyId" TEXT NOT NULL, "responsibleId" TEXT NOT NULL, "categoryId" TEXT, CONSTRAINT "Income_pkey" PRIMARY KEY ("id"));`,
  `CREATE TABLE IF NOT EXISTS "CreditCard" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "bank" TEXT NOT NULL, "limitTotal" DECIMAL(12,2) NOT NULL, "dueDay" INTEGER NOT NULL, "bestPurchaseDay" INTEGER NOT NULL, "closingDay" INTEGER NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "familyId" TEXT NOT NULL, "ownerId" TEXT NOT NULL, CONSTRAINT "CreditCard_pkey" PRIMARY KEY ("id"));`,
  `CREATE TABLE IF NOT EXISTS "Invoice" ("id" TEXT NOT NULL, "referenceMonth" TIMESTAMP(3) NOT NULL, "closingDate" TIMESTAMP(3) NOT NULL, "dueDate" TIMESTAMP(3) NOT NULL, "totalValue" DECIMAL(12,2) NOT NULL DEFAULT 0, "status" "InvoiceStatus" NOT NULL DEFAULT 'OPEN', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "familyId" TEXT NOT NULL, "cardId" TEXT NOT NULL, CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id"));`,
  `CREATE TABLE IF NOT EXISTS "Expense" ("id" TEXT NOT NULL, "description" TEXT NOT NULL, "value" DECIMAL(12,2) NOT NULL, "spentAt" TIMESTAMP(3) NOT NULL, "paymentMethod" "PaymentMethod" NOT NULL, "shared" BOOLEAN NOT NULL DEFAULT false, "notes" TEXT, "installmentsCount" INTEGER NOT NULL DEFAULT 1, "installmentNumber" INTEGER NOT NULL DEFAULT 1, "installmentGroupId" TEXT, "status" "ExpenseStatus" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "familyId" TEXT NOT NULL, "categoryId" TEXT NOT NULL, "responsibleId" TEXT NOT NULL, "createdById" TEXT NOT NULL, "cardId" TEXT, "invoiceId" TEXT, CONSTRAINT "Expense_pkey" PRIMARY KEY ("id"));`,
  `CREATE TABLE IF NOT EXISTS "Bill" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "value" DECIMAL(12,2) NOT NULL, "dueDate" TIMESTAMP(3) NOT NULL, "recurring" BOOLEAN NOT NULL DEFAULT false, "frequency" "Frequency", "status" "BillStatus" NOT NULL DEFAULT 'PENDING', "notes" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "familyId" TEXT NOT NULL, "categoryId" TEXT NOT NULL, "responsibleId" TEXT NOT NULL, CONSTRAINT "Bill_pkey" PRIMARY KEY ("id"));`,

  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "UserRole" DEFAULT 'MEMBER';`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "familyId" TEXT;`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profileId" TEXT;`,
  `ALTER TABLE "Family" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
  `ALTER TABLE "Family" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Session_token_key" ON "Session"("token");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "FamilyMember_familyId_name_key" ON "FamilyMember"("familyId", "name");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Category_familyId_name_type_key" ON "Category"("familyId", "name", "type");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "CreditCard_familyId_name_key" ON "CreditCard"("familyId", "name");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_cardId_referenceMonth_key" ON "Invoice"("cardId", "referenceMonth");`,
];

export async function POST(request: NextRequest) {
  const setupToken = process.env.SETUP_TOKEN;
  const requestToken = request.headers.get("x-setup-token");

  if (!setupToken || requestToken !== setupToken) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const prisma = getPrisma();

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }

  return NextResponse.json({ ok: true, statements: statements.length });
}
