import { Trash2 } from "lucide-react";

import { IncomeDialog } from "@/components/income-dialog";
import { deleteEntityAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { getFamilyLookups, getIncomes } from "@/lib/data";
import { money, shortDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function IncomesPage() {
  const user = await requireUser();
  const [incomes, lookups] = await Promise.all([getIncomes(user.familyId), getFamilyLookups(user.familyId)]);
  const total = incomes.reduce((sum, income) => sum + Number(income.value), 0);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-4xl font-semibold">Rendas</h2>
          <p className="text-slate-600">Entradas fixas, variaveis, previstas e recebidas.</p>
        </div>
        <IncomeDialog members={lookups.members} />
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-lg border-blue-100 bg-emerald-700 text-white shadow-sm md:col-span-2">
          <CardHeader>
            <CardDescription className="text-emerald-50">Total cadastrado</CardDescription>
            <CardTitle className="text-4xl">{money(total)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg border-blue-100 shadow-sm">
          <CardHeader>
            <CardDescription>Fontes de renda</CardDescription>
            <CardTitle className="text-4xl">{incomes.length}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="rounded-lg border-blue-100 shadow-sm">
        <CardHeader>
          <CardTitle>Rendas cadastradas</CardTitle>
          <CardDescription>Use o botao “Nova renda” para adicionar entradas sem sair da tela.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descricao</TableHead>
                <TableHead>Responsavel</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes.map((income) => (
                <TableRow key={income.id}>
                  <TableCell className="font-medium">{income.description}</TableCell>
                  <TableCell>{income.responsible.name}</TableCell>
                  <TableCell>{shortDate.format(income.receivedAt)}</TableCell>
                  <TableCell><Badge variant="secondary">{income.status}</Badge></TableCell>
                  <TableCell className="text-right font-semibold text-emerald-700">{money(income.value)}</TableCell>
                  <TableCell className="text-right">
                    <form action={deleteEntityAction}>
                      <input type="hidden" name="entity" value="income" />
                      <input type="hidden" name="id" value={income.id} />
                      <Button variant="ghost" size="icon" aria-label={`Excluir ${income.description}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
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
