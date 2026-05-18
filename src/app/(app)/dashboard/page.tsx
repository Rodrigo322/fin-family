import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CalendarDays, CreditCard, Receipt, Wallet } from "lucide-react";

import { CategoryPieChart, MethodBarChart } from "@/components/finance-charts";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";
import { money, shortDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.familyId);

  const cards = [
    { label: "Renda total do mes", value: data.incomeTotal, icon: Wallet, color: "text-emerald-700" },
    { label: "Total gasto no credito", value: data.creditTotal, icon: CreditCard, color: "text-blue-700" },
    { label: "Total gasto no debito", value: data.debitTotal, icon: Receipt, color: "text-emerald-700" },
    { label: "Saldo estimado", value: data.balance, icon: ArrowUpRight, color: data.balance >= 0 ? "text-emerald-700" : "text-red-700" },
  ];

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="rounded-lg border-blue-100 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardDescription>{item.label}</CardDescription>
                  <CardTitle className={`mt-3 text-3xl ${item.color}`}>{money(item.value)}</CardTitle>
                </div>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </CardHeader>
              <CardContent>
                <Progress value={Math.min(100, Math.abs(item.value / Math.max(data.incomeTotal, 1)) * 100)} className="h-2" />
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card className="rounded-lg border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Distribuição por categoria</CardTitle>
              <CardDescription>Gastos do mes atual agrupados por categoria.</CardDescription>
            </div>
            <Button asChild variant="ghost">
              <Link href="/reports">Ver detalhes</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={data.categoryChart} />
          </CardContent>
        </Card>

        <Card className="rounded-lg border-blue-100 bg-blue-100/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              <AlertTriangle className="h-5 w-5" />
              Alertas do mês
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-md border-l-4 border-red-600 bg-white p-4">
              <p className="text-sm text-slate-600">Contas pendentes</p>
              <p className="text-2xl font-semibold text-red-700">{money(data.pendingBillsTotal)}</p>
            </div>
            <div className="rounded-md border-l-4 border-emerald-700 bg-white p-4">
              <p className="text-sm text-slate-600">Saldo estimado no fim do mês</p>
              <p className="text-2xl font-semibold text-slate-950">{money(data.balance)}</p>
              <p className="text-sm text-emerald-700">Margem de segurança acompanhada</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card className="rounded-lg border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Últimos lançamentos</CardTitle>
            <Button asChild variant="ghost">
              <Link href="/expenses">Ver histórico</Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3">
            {data.expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between rounded-md border border-slate-100 p-3">
                <div>
                  <p className="font-medium">{expense.description}</p>
                  <p className="text-sm text-slate-500">
                    {shortDate.format(expense.spentAt)} · {expense.category.name} · {expense.responsible.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-700">- {money(expense.value)}</p>
                  <Badge variant="secondary">{expense.paymentMethod}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="rounded-lg border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle>Próximos vencimentos</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[...data.bills, ...data.invoices].slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-md bg-blue-100 text-blue-800">
                      <CalendarDays className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-medium">{"name" in item ? item.name : item.card.name}</p>
                      <p className="text-sm text-slate-500">{shortDate.format(item.dueDate)}</p>
                    </div>
                  </div>
                  <p className="font-semibold">{money("value" in item ? item.value : item.totalValue)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-lg border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle>Crédito x débito</CardTitle>
            </CardHeader>
            <CardContent>
              <MethodBarChart data={data.methodChart} />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
