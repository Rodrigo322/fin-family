"use client";

import { Palette, Plus } from "lucide-react";

import { createCategoryAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CategoryDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" className="bg-emerald-700 text-white shadow-md hover:bg-emerald-800" />}>
        <Plus className="h-4 w-4" />
        Nova categoria
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-2rem)] overflow-hidden rounded-2xl p-0 sm:max-w-lg">
        <div className="bg-gradient-to-br from-emerald-700 to-blue-700 px-6 py-5 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-white/15">
                <Palette className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-xl text-white">Cadastrar categoria</DialogTitle>
                <DialogDescription className="text-blue-50">
                  Crie grupos claros para receitas, despesas e relatorios.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form action={createCategoryAction} className="grid gap-5 p-6">
          <Field label="Nome">
            <Input name="name" placeholder="Mercado, Escola, Farmacia..." required />
          </Field>

          <div className="grid gap-4 sm:grid-cols-[1fr_96px]">
            <Field label="Tipo">
              <select name="type" className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </select>
            </Field>
            <Field label="Cor">
              <Input name="color" type="color" defaultValue="#047857" className="h-10 p-1" aria-label="Cor" />
            </Field>
          </div>

          <Field label="Icone opcional">
            <Input name="icon" placeholder="Ex: shopping-cart, home, fuel" />
          </Field>

          <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
            <Button type="submit" className="h-11 bg-emerald-700 hover:bg-emerald-800">
              Salvar categoria
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
