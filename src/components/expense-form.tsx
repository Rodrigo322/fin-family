"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Save, Users } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { createExpenseAction } from "@/lib/actions";
import { dateInputValue } from "@/lib/format";
import { expenseSchema } from "@/lib/validations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ExpenseInput = z.input<typeof expenseSchema>;

type Option = {
  id: string;
  name: string;
  color?: string;
  bank?: string;
};

export function ExpenseForm({
  categories,
  members,
  cards,
}: {
  categories: Option[];
  members: Option[];
  cards: Option[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      value: 0,
      spentAt: dateInputValue(),
      categoryId: categories[0]?.id,
      responsibleId: members[0]?.id,
      paymentMethod: "DEBIT",
      shared: true,
      installmentsCount: 1,
      notes: "",
    },
  });
  const method = useWatch({ control, name: "paymentMethod" });

  function onSubmit(values: ExpenseInput) {
    startTransition(async () => {
      await createExpenseAction(values);
      router.push("/expenses");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="rounded-lg border-blue-100 shadow-sm">
        <CardHeader>
          <CardTitle>Lançar gasto</CardTitle>
          <CardDescription>Registre debito, pix, dinheiro ou compras no cartao com parcelamento automatico.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <Field label="Valor" error={errors.value?.message}>
              <Input type="number" step="0.01" placeholder="0,00" {...register("value")} />
            </Field>
            <Field label="Descricao" error={errors.description?.message}>
              <Input placeholder="Ex: mercado, aluguel, cinema..." {...register("description")} />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Data do gasto" error={errors.spentAt?.message?.toString()}>
              <Input type="date" {...register("spentAt")} />
            </Field>
            <Field label="Categoria" error={errors.categoryId?.message}>
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" {...register("categoryId")}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-3">
            <Label>Forma de pagamento</Label>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ["DEBIT", "Debito"],
                ["CREDIT", "Credito"],
                ["PIX", "Pix"],
                ["CASH", "Dinheiro"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-blue-100 bg-white text-sm font-medium shadow-sm has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-700"
                >
                  <input className="sr-only" type="radio" value={value} {...register("paymentMethod")} />
                  <CreditCard className="h-5 w-5" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {method === "CREDIT" ? (
            <div className="grid gap-4 rounded-md border border-blue-100 bg-blue-50 p-4 md:grid-cols-2">
              <Field label="Cartao usado" error={errors.cardId?.message}>
                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" {...register("cardId")}>
                  <option value="">Escolha o cartao</option>
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name} - {card.bank}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Parcelas" error={errors.installmentsCount?.message}>
                <Input type="number" min={1} max={48} {...register("installmentsCount")} />
              </Field>
            </div>
          ) : null}

          <Field label="Responsavel" error={errors.responsibleId?.message}>
            <div className="grid gap-3 sm:grid-cols-2">
              {members.map((member) => (
                <label
                  key={member.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md border border-blue-100 bg-white p-4 has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-50"
                >
                  <input className="h-4 w-4 accent-emerald-700" type="radio" value={member.id} {...register("responsibleId")} />
                  <span className="grid h-9 w-9 place-items-center rounded-full text-sm font-semibold text-white" style={{ background: member.color }}>
                    {member.name[0]}
                  </span>
                  {member.name}
                </label>
              ))}
            </div>
          </Field>

          <div className="flex items-center justify-between rounded-md border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-emerald-700" />
              <div>
                <p className="font-medium">Gasto familiar compartilhado</p>
                <p className="text-sm text-slate-600">Use para despesas da casa ou do casal.</p>
              </div>
            </div>
            <Checkbox
              defaultChecked
              onCheckedChange={(checked) => setValue("shared", checked === true)}
            />
          </div>

          <Field label="Observacao opcional">
            <Textarea placeholder="Detalhes, local da compra ou combinados do casal..." {...register("notes")} />
          </Field>

          <Button className="h-12 bg-emerald-700 text-base hover:bg-emerald-800" disabled={pending}>
            <Save className="h-5 w-5" />
            {pending ? "Salvando..." : "Salvar gasto"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid content-start gap-5">
        <Card className="rounded-lg border-blue-100 bg-blue-600 text-white shadow-md">
          <CardHeader>
            <CardTitle>Mantenha a serenidade</CardTitle>
            <CardDescription className="text-blue-50">
              Gasto lancado no momento certo evita surpresa no fim do mes.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="rounded-lg border-dashed border-emerald-200">
          <CardHeader>
            <Badge className="w-fit bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Resumo rapido</Badge>
            <CardTitle className="text-lg">Credito exige cartao</CardTitle>
            <CardDescription>
              Se houver parcelas, o app cria as parcelas futuras e vincula cada uma a fatura correta.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
