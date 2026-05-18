import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";

import { deleteExpenseAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { getExpenses } from "@/lib/data";
import { money, shortDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function ExpensesPage() {
  const user = await requireUser();
  const expenses = await getExpenses(user.familyId);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-semibold">Gastos</h2>
          <p className="text-slate-600">Débito, crédito, pix, dinheiro e parcelas futuras.</p>
        </div>
        <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
          <Link href="/expenses/new">
            <Plus className="h-4 w-4" />
            Novo gasto
          </Link>
        </Button>
      </div>

      <Card className="rounded-lg border-blue-100 shadow-sm">
        <CardHeader>
          <CardTitle>Histórico de lançamentos</CardTitle>
          <CardDescription>Ao excluir uma compra parcelada voce pode remover apenas a parcela ou todas.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="min-w-60">
                    <p className="font-medium">{expense.description}</p>
                    {expense.card ? <p className="text-xs text-slate-500">{expense.card.name}</p> : null}
                  </TableCell>
                  <TableCell>{shortDate.format(expense.spentAt)}</TableCell>
                  <TableCell>{expense.category.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{expense.paymentMethod}</Badge>
                  </TableCell>
                  <TableCell>{expense.responsible.name}</TableCell>
                  <TableCell>
                    <Badge className={expense.status === "PAID" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-blue-100 text-blue-800 hover:bg-blue-100"}>
                      {expense.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{money(expense.value)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <form action={deleteExpenseAction}>
                        <input type="hidden" name="id" value={expense.id} />
                        <input type="hidden" name="mode" value="single" />
                        <Button variant="ghost" size="icon" aria-label="Excluir parcela">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                      {expense.installmentGroupId ? (
                        <form action={deleteExpenseAction}>
                          <input type="hidden" name="id" value={expense.id} />
                          <input type="hidden" name="mode" value="all" />
                          <Button variant="outline" size="sm">Todas</Button>
                        </form>
                      ) : null}
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
