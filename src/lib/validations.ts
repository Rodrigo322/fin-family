import { z } from "zod";

const money = z.coerce.number().positive("Informe um valor maior que zero.");
const required = z.string().min(2, "Preencha este campo.");

export const loginSchema = z.object({
  email: z.string().email("E-mail invalido."),
  password: z.string().min(6, "Senha muito curta."),
});

export const registerSchema = loginSchema.extend({
  name: required,
  spouseName: z.string().min(2).optional().or(z.literal("")),
  familyName: required,
});

export const incomeSchema = z.object({
  description: required,
  value: money,
  type: z.enum(["FIXED", "VARIABLE"]),
  responsibleId: z.string().min(1),
  receivedAt: z.coerce.date(),
  recurring: z.coerce.boolean().default(false),
  status: z.enum(["EXPECTED", "RECEIVED"]),
});

export const categorySchema = z.object({
  name: required,
  type: z.enum(["INCOME", "EXPENSE"]),
  color: z.string().min(4),
  icon: z.string().optional(),
});

export const memberSchema = z.object({
  name: required,
  label: z.string().optional(),
  color: z.string().min(4),
});

export const cardSchema = z.object({
  name: required,
  bank: required,
  ownerId: z.string().min(1),
  limitTotal: money,
  dueDay: z.coerce.number().int().min(1).max(31),
  closingDay: z.coerce.number().int().min(1).max(31),
  bestPurchaseDay: z.coerce.number().int().min(1).max(31),
  active: z.coerce.boolean().default(true),
});

export const billSchema = z.object({
  name: required,
  value: money,
  categoryId: z.string().min(1),
  responsibleId: z.string().min(1),
  dueDate: z.coerce.date(),
  recurring: z.coerce.boolean().default(false),
  frequency: z.enum(["MONTHLY", "WEEKLY", "YEARLY"]).optional().or(z.literal("")),
  status: z.enum(["PENDING", "PAID", "OVERDUE"]),
  notes: z.string().optional(),
});

export const expenseSchema = z
  .object({
    description: required,
    value: money,
    spentAt: z.coerce.date(),
    categoryId: z.string().min(1, "Escolha uma categoria."),
    paymentMethod: z.enum(["DEBIT", "CREDIT", "PIX", "CASH"]),
    responsibleId: z.string().min(1, "Escolha um responsavel."),
    shared: z.coerce.boolean().default(false),
    notes: z.string().optional(),
    cardId: z.string().optional(),
    installmentsCount: z.coerce.number().int().min(1).max(48).default(1),
  })
  .superRefine((value, ctx) => {
    if (value.paymentMethod === "CREDIT" && !value.cardId) {
      ctx.addIssue({
        code: "custom",
        path: ["cardId"],
        message: "Escolha o cartao usado no credito.",
      });
    }
  });

export type ExpenseFormInput = z.infer<typeof expenseSchema>;
