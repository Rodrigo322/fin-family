import { CreditCard, Trash2 } from "lucide-react";

import { CreditCardDialog } from "@/components/credit-card-dialog";
import { deleteEntityAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { getCards, getFamilyLookups } from "@/lib/data";
import { money } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function CreditCardsPage() {
  const user = await requireUser();
  const [cards, lookups] = await Promise.all([getCards(user.familyId), getFamilyLookups(user.familyId)]);
  const usedTotal = cards.reduce((sum, card) => sum + card.expenses.reduce((cardSum, expense) => cardSum + Number(expense.value), 0), 0);
  const limitTotal = cards.reduce((sum, card) => sum + Number(card.limitTotal), 0);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-4xl font-semibold">Cartoes de credito</h2>
          <p className="text-slate-600">Limites, vencimentos, faturas e compras parceladas.</p>
        </div>
        <CreditCardDialog members={lookups.members} />
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-lg border-blue-100 shadow-sm md:col-span-2">
          <CardHeader>
            <CardDescription>Divida combinada nos cartoes</CardDescription>
            <CardTitle className="text-4xl text-emerald-800">{money(usedTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm"><span>Limite usado</span><span>{money(limitTotal)}</span></div>
            <Progress value={limitTotal ? (usedTotal / limitTotal) * 100 : 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card className="rounded-lg border-blue-100 bg-blue-50 shadow-sm">
          <CardHeader>
            <CreditCard className="h-6 w-6 text-blue-700" />
            <CardTitle>Cartoes da esposa</CardTitle>
            <CardDescription>Rodrigo tambem pode lancar compras nesses cartoes.</CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {cards.map((card) => {
          const used = card.expenses.reduce((sum, expense) => sum + Number(expense.value), 0);
          const limit = Number(card.limitTotal);
          return (
            <Card key={card.id} className="overflow-hidden rounded-lg border-blue-100 shadow-sm">
              <div className="bg-gradient-to-br from-blue-700 to-emerald-700 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-blue-100">{card.bank}</p>
                    <h3 className="text-2xl font-semibold">{card.name}</h3>
                    <p className="text-sm text-blue-100">Dono: {card.owner.name}</p>
                  </div>
                  <Badge className="bg-white/20 text-white hover:bg-white/20">{card.active ? "Ativo" : "Inativo"}</Badge>
                </div>
                <p className="mt-8 text-3xl tracking-[0.25em]">**** {card.id.slice(-4).toUpperCase()}</p>
              </div>
              <CardContent className="grid gap-4 p-6">
                <div className="flex justify-between"><span>Usado</span><strong>{money(used)} / {money(limit)}</strong></div>
                <Progress value={limit ? (used / limit) * 100 : 0} />
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <span>Vence dia <strong>{card.dueDay}</strong></span>
                  <span>Fecha dia <strong>{card.closingDay}</strong></span>
                  <span>Melhor dia <strong>{card.bestPurchaseDay}</strong></span>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-sm text-slate-600">{card.invoices.length} faturas</span>
                  <form action={deleteEntityAction}>
                    <input type="hidden" name="entity" value="card" />
                    <input type="hidden" name="id" value={card.id} />
                    <Button variant="ghost" size="icon" aria-label={`Excluir ${card.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
