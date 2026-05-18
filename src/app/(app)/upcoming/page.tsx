import { CalendarDays } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { getUpcoming } from "@/lib/data";
import { money, monthName, shortDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function UpcomingPage() {
  const user = await requireUser();
  const { bills, expenses, invoices } = await getUpcoming(user.familyId);
  const items = [
    ...bills.map((bill) => ({ id: bill.id, date: bill.dueDate, title: bill.name, subtitle: bill.category.name, value: Number(bill.value), status: bill.status })),
    ...expenses.map((expense) => ({ id: expense.id, date: expense.spentAt, title: expense.description, subtitle: `${expense.card?.name ?? expense.paymentMethod} · ${expense.responsible.name}`, value: Number(expense.value), status: expense.status })),
    ...invoices.map((invoice) => ({ id: invoice.id, date: invoice.dueDate, title: `Fatura ${invoice.card.name}`, subtitle: monthName.format(invoice.referenceMonth), value: Number(invoice.totalValue), status: invoice.status })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const byMonth = items.reduce<Map<string, typeof items>>((map, item) => {
    const key = monthName.format(item.date);
    map.set(key, [...(map.get(key) ?? []), item]);
    return map;
  }, new Map());

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-lg border-blue-100 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardDescription>Previsão dos próximos 120 dias</CardDescription>
            <CardTitle className="text-4xl text-emerald-800">{money(total)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">{items.length} compromissos financeiros agendados.</p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-blue-100 bg-emerald-600 text-white shadow-sm">
          <CardHeader>
            <CalendarDays className="h-8 w-8" />
            <CardTitle>Linha do tempo mensal</CardTitle>
            <CardDescription className="text-emerald-50">Contas, faturas e parcelas futuras.</CardDescription>
          </CardHeader>
        </Card>
      </section>

      {[...byMonth.entries()].map(([month, monthItems]) => (
        <section key={month} className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold capitalize">{month}</h2>
            <p className="font-semibold">Subtotal: {money(monthItems.reduce((sum, item) => sum + item.value, 0))}</p>
          </div>
          {monthItems.map((item) => (
            <Card key={item.id} className="rounded-lg border-blue-100 shadow-sm">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-md bg-blue-100 text-blue-700">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.subtitle} · {shortDate.format(item.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold">{money(item.value)}</p>
                  <Badge variant="secondary">{item.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      ))}
    </div>
  );
}
