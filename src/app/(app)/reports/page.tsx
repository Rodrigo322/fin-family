import { Download } from "lucide-react";

import { CategoryPieChart, MethodBarChart } from "@/components/finance-charts";
import { requireUser } from "@/lib/auth";
import { getDashboardData, getFamilyOverview } from "@/lib/data";
import { money } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function ReportsPage() {
  const user = await requireUser();
  const [dashboard, family] = await Promise.all([getDashboardData(user.familyId), getFamilyOverview(user.familyId)]);
  const totalExpenses = family.expenses.reduce((sum, expense) => sum + Number(expense.value), 0);
  const byPerson = family.members.map((member) => {
    const value = family.expenses.filter((expense) => expense.responsibleId === member.id).reduce((sum, expense) => sum + Number(expense.value), 0);
    return { name: member.name, value, color: member.color };
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-semibold">Relatórios</h2>
          <p className="text-slate-600">Gastos, categorias, pessoas, formas de pagamento e previsão.</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4" /> Exportar</Button>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-lg border-blue-100 shadow-sm">
          <CardHeader>
            <CardDescription>Total de despesas no mês</CardDescription>
            <CardTitle className="text-4xl">{money(dashboard.creditTotal + dashboard.debitTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <MethodBarChart data={dashboard.methodChart} />
          </CardContent>
        </Card>
        <Card className="rounded-lg border-blue-100 shadow-sm">
          <CardHeader>
            <CardTitle>Métodos de pagamento</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            {dashboard.methodChart.map((item) => (
              <div key={item.name} className="grid gap-2">
                <div className="flex justify-between"><span>{item.name}</span><strong>{money(item.value)}</strong></div>
                <Progress value={(item.value / Math.max(dashboard.creditTotal + dashboard.debitTotal, 1)) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-lg border-blue-100 shadow-sm">
          <CardHeader>
            <CardTitle>Gastos por categoria</CardTitle>
          </CardHeader>
          <CardContent><CategoryPieChart data={dashboard.categoryChart} /></CardContent>
        </Card>
        <Card className="rounded-lg border-blue-100 shadow-sm">
          <CardHeader>
            <CardTitle>Gastos por pessoa</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {byPerson.map((person) => (
              <div key={person.name} className="grid gap-2">
                <div className="flex justify-between"><span>{person.name}</span><strong>{money(person.value)}</strong></div>
                <Progress value={totalExpenses ? (person.value / totalExpenses) * 100 : 0} />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-lg border-blue-100 bg-blue-50 shadow-sm">
        <CardHeader>
          <CardTitle>Previsão dos próximos meses</CardTitle>
          <CardDescription>
            Com base em renda cadastrada, contas pendentes e faturas futuras, o saldo estimado atual é <strong>{money(dashboard.balance)}</strong>.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
