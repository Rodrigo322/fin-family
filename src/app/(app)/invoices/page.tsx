import { CheckCircle2 } from "lucide-react";

import { markInvoicePaidAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { getInvoices } from "@/lib/data";
import { money, monthName, shortDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function InvoicesPage() {
  const user = await requireUser();
  const invoices = await getInvoices(user.familyId);

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-semibold">Faturas</h2>
        <p className="text-slate-600">Compras no crédito entram automaticamente na fatura correta.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {invoices.slice(0, 3).map((invoice) => (
          <Card key={invoice.id} className="rounded-lg border-blue-100 shadow-sm">
            <CardHeader>
              <CardDescription>{invoice.card.name}</CardDescription>
              <CardTitle>{monthName.format(invoice.referenceMonth)}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p className="text-3xl font-semibold text-emerald-800">{money(invoice.totalValue)}</p>
              <div className="text-sm text-slate-600">
                Fecha {shortDate.format(invoice.closingDate)} · Vence {shortDate.format(invoice.dueDate)}
              </div>
              <Badge variant="secondary" className="w-fit">{invoice.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-lg border-blue-100 shadow-sm">
        <CardHeader>
          <CardTitle>Gestão de faturas</CardTitle>
          <CardDescription>Marcar uma fatura como paga também marca seus gastos vinculados como pagos.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cartão</TableHead>
                <TableHead>Mês</TableHead>
                <TableHead>Fechamento</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.card.name}</TableCell>
                  <TableCell>{monthName.format(invoice.referenceMonth)}</TableCell>
                  <TableCell>{shortDate.format(invoice.closingDate)}</TableCell>
                  <TableCell>{shortDate.format(invoice.dueDate)}</TableCell>
                  <TableCell><Badge variant="secondary">{invoice.status}</Badge></TableCell>
                  <TableCell className="text-right font-semibold">{money(invoice.totalValue)}</TableCell>
                  <TableCell className="text-right">
                    <form action={markInvoicePaidAction}>
                      <input type="hidden" name="id" value={invoice.id} />
                      <Button size="sm" variant="outline" disabled={invoice.status === "PAID"}>
                        <CheckCircle2 className="h-4 w-4" />
                        Pagar
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
