import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ExpenseForm } from "@/components/expense-form";
import { requireUser } from "@/lib/auth";
import { getFamilyLookups } from "@/lib/data";
import { Button } from "@/components/ui/button";

export default async function NewExpensePage() {
  const user = await requireUser();
  const { categories, members, cards } = await getFamilyLookups(user.familyId);

  return (
    <div className="grid gap-6">
      <Button asChild variant="ghost" className="w-fit">
        <Link href="/expenses">
          <ArrowLeft className="h-4 w-4" />
          Voltar para gastos
        </Link>
      </Button>
      <ExpenseForm
        categories={categories.filter((category) => category.type === "EXPENSE")}
        members={members}
        cards={cards}
      />
    </div>
  );
}
