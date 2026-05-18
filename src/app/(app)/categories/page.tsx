import { Trash2 } from "lucide-react";

import { CategoryDialog } from "@/components/category-dialog";
import { deleteEntityAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { getCategories } from "@/lib/data";
import { money } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function CategoriesPage() {
  const user = await requireUser();
  const categories = await getCategories(user.familyId);
  const expenseTotal = categories.reduce((sum, category) => sum + category.expenses.reduce((itemSum, expense) => itemSum + Number(expense.value), 0), 0);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="text-4xl font-semibold">Categorias financeiras</h2>
          <p className="max-w-2xl text-slate-600">Organize gastos e receitas em grupos faceis de comparar.</p>
        </div>
        <CategoryDialog />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => {
          const total = category.expenses.reduce((sum, expense) => sum + Number(expense.value), 0);
          return (
            <Card key={category.id} className="rounded-lg border-blue-100 shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-md text-white" style={{ background: category.color }}>
                    {category.name[0]}
                  </span>
                  <Badge variant="secondary">{category.type}</Badge>
                </div>
                <CardTitle>{category.name}</CardTitle>
                <CardDescription>{category.expenses.length + category.incomes.length + category.bills.length} movimentos</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Gasto</span>
                  <strong>{money(total)}</strong>
                </div>
                <Progress value={expenseTotal ? (total / expenseTotal) * 100 : 0} />
                <form action={deleteEntityAction} className="text-right">
                  <input type="hidden" name="entity" value="category" />
                  <input type="hidden" name="id" value={category.id} />
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="rounded-lg border-blue-100 bg-blue-50 shadow-sm">
        <CardHeader>
          <CardTitle>Analise de orcamento</CardTitle>
          <CardDescription>
            Total gasto registrado nas categorias: <strong>{money(expenseTotal)}</strong>. Use cores para leitura rapida nos graficos.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
