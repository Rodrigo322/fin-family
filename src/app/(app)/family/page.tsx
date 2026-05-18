import { Trash2, Users } from "lucide-react";

import { MemberProfileDialog } from "@/components/member-profile-dialog";
import { deleteEntityAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { getFamilyOverview } from "@/lib/data";
import { money } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function FamilyPage() {
  const user = await requireUser();
  const { members, expenses, incomes } = await getFamilyOverview(user.familyId);
  const shared = expenses.filter((expense) => expense.shared).reduce((sum, expense) => sum + Number(expense.value), 0);
  const memberTotals = members.map((member) => ({
    ...member,
    expenses: expenses.filter((expense) => expense.responsibleId === member.id).reduce((sum, expense) => sum + Number(expense.value), 0),
    incomes: incomes.filter((income) => income.responsibleId === member.id).reduce((sum, income) => sum + Number(income.value), 0),
  }));
  const totalExpenses = memberTotals.reduce((sum, member) => sum + member.expenses, 0);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-4xl font-semibold">Familia</h2>
          <p className="text-slate-600">Perfis financeiros, responsaveis e gastos compartilhados.</p>
        </div>
        <MemberProfileDialog />
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {memberTotals.map((member) => (
          <Card key={member.id} className="rounded-lg border-blue-100 shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-14 w-14 place-items-center rounded-md text-lg font-semibold text-white" style={{ background: member.color }}>
                    {member.name[0]}
                  </span>
                  <div>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.label}</CardDescription>
                  </div>
                </div>
                <MemberProfileDialog member={member} variant="icon" />
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex justify-between">
                <span>Renda</span>
                <strong className="text-emerald-700">{money(member.incomes)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Gastos</span>
                <strong>{money(member.expenses)}</strong>
              </div>
              <Progress value={totalExpenses ? (member.expenses / totalExpenses) * 100 : 0} />
            </CardContent>
          </Card>
        ))}

        <Card className="rounded-lg border-blue-100 bg-emerald-700 text-white shadow-sm">
          <CardHeader className="items-center text-center">
            <Users className="h-8 w-8" />
            <CardDescription className="text-emerald-50">Gastos familiares compartilhados</CardDescription>
            <CardTitle className="text-4xl">{money(shared)}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="rounded-lg border-blue-100 shadow-sm">
        <CardHeader>
          <CardTitle>Responsabilidades recentes</CardTitle>
          <CardDescription>Veja quem ficou responsavel por cada lancamento e edite perfis quando necessario.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pessoa</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.slice(0, 6).map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.responsible.name}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.category.name}</TableCell>
                  <TableCell className="text-right font-semibold">{money(expense.value)}</TableCell>
                </TableRow>
              ))}
              {members.map((member) => (
                <TableRow key={`member-${member.id}`}>
                  <TableCell colSpan={3} className="text-slate-500">
                    Perfil cadastrado: {member.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <MemberProfileDialog member={member} variant="icon" />
                      <form action={deleteEntityAction}>
                        <input type="hidden" name="entity" value="member" />
                        <input type="hidden" name="id" value={member.id} />
                        <Button variant="ghost" size="icon" aria-label={`Excluir ${member.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
