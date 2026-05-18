import { CheckCircle2, Edit3, Trash2 } from "lucide-react";

import { BillDetailsDialog, type BillDetailsData } from "@/components/bill-details-dialog";
import { BillDialog } from "@/components/bill-dialog";
import { deleteEntityAction, markBillPaidAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { getBills, getFamilyLookups } from "@/lib/data";
import { dateInputValue, money, shortDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default async function BillsPage() {
  const user = await requireUser();
  const [bills, lookups] = await Promise.all([getBills(user.familyId), getFamilyLookups(user.familyId)]);
  const total = bills.reduce((sum, bill) => sum + Number(bill.value), 0);
  const overdue = bills.filter((bill) => bill.status === "OVERDUE");
  const next = bills.filter((bill) => bill.status === "PENDING").slice(0, 5);
  const billRows: BillDetailsData[] = bills.map((bill) => ({
    id: bill.id,
    name: bill.name,
    value: Number(bill.value),
    categoryId: bill.categoryId,
    categoryName: bill.category.name,
    responsibleId: bill.responsibleId,
    responsibleName: bill.responsible.name,
    dueDate: dateInputValue(bill.dueDate),
    dueDateLabel: shortDate.format(bill.dueDate),
    recurring: bill.recurring,
    frequency: bill.frequency,
    status: bill.status,
    notes: bill.notes,
  }));

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-4xl font-semibold">Contas</h2>
          <p className="text-slate-600">Contas fixas, variaveis, recorrentes e proximos vencimentos.</p>
        </div>
        <BillDialog members={lookups.members} categories={lookups.categories} />
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric title="Orcamento mensal de contas" value={money(total)} />
        <Metric title="Atrasadas" value={`${overdue.length} contas`} danger />
        <Metric title="Proximos 7 dias" value={`${next.length} contas`} />
      </section>

      <Card className="rounded-lg border-blue-100 shadow-sm">
        <CardHeader>
          <CardTitle>Contas em andamento</CardTitle>
          <CardDescription>Use “Nova conta” para cadastrar vencimentos sem sair da listagem.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conta</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billRows.map((bill) => (
                <TableRow key={bill.id} className="focus-within:bg-emerald-50/60">
                  <TableCell className="font-medium">
                    <span className="block">{bill.name}</span>
                    <span className="text-xs text-slate-500">{bill.responsibleName}</span>
                  </TableCell>
                  <TableCell>{bill.categoryName}</TableCell>
                  <TableCell>{bill.dueDateLabel}</TableCell>
                  <TableCell><Badge variant="secondary">{bill.status}</Badge></TableCell>
                  <TableCell className="text-right font-semibold">{money(bill.value)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <BillDetailsDialog bill={bill} />
                      <BillDialog
                        members={lookups.members}
                        categories={lookups.categories}
                        bill={bill}
                        trigger={
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label={`Editar ${bill.name}`}
                            title={`Editar ${bill.name}`}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <form action={markBillPaidAction}>
                        <input type="hidden" name="id" value={bill.id} />
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                variant="outline"
                                size="icon"
                                aria-label={`Marcar ${bill.name} como paga`}
                                title={`Marcar ${bill.name} como paga`}
                              />
                            }
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>Marcar como paga</TooltipContent>
                        </Tooltip>
                      </form>
                      <form action={deleteEntityAction}>
                        <input type="hidden" name="entity" value="bill" />
                        <input type="hidden" name="id" value={bill.id} />
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Excluir ${bill.name}`}
                                title={`Excluir ${bill.name}`}
                              />
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>Excluir conta</TooltipContent>
                        </Tooltip>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {billRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                    Nenhuma conta cadastrada ainda.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value, danger }: { title: string; value: string; danger?: boolean }) {
  return (
    <Card className="rounded-lg border-blue-100 shadow-sm">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className={danger ? "text-red-700" : "text-slate-950"}>{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
