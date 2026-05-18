"use client";

import { CreditCard, Plus } from "lucide-react";

import { createCardAction } from "@/lib/actions";
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

type MemberOption = {
  id: string;
  name: string;
};

export function CreditCardDialog({ members }: { members: MemberOption[] }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" className="bg-emerald-700 text-white shadow-md hover:bg-emerald-800" />}>
        <Plus className="h-4 w-4" />
        Novo cartao
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-2rem)] overflow-hidden rounded-2xl p-0 sm:max-w-2xl">
        <div className="bg-gradient-to-br from-blue-800 to-emerald-700 px-6 py-5 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-white/15">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-xl text-white">Cadastrar cartao</DialogTitle>
                <DialogDescription className="text-blue-50">
                  Controle limite, vencimento, fechamento e melhor dia de compra.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form action={createCardAction} className="grid gap-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome do cartao">
              <Input name="name" placeholder="Nubank Platinum" required />
            </Field>
            <Field label="Banco">
              <Input name="bank" placeholder="Nubank" required />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Dono do cartao">
              <select name="ownerId" className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Limite total">
              <Input name="limitTotal" type="number" step="0.01" placeholder="0,00" required />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Vencimento">
              <Input name="dueDay" type="number" min={1} max={31} defaultValue={15} />
            </Field>
            <Field label="Fechamento">
              <Input name="closingDay" type="number" min={1} max={31} defaultValue={8} />
            </Field>
            <Field label="Melhor compra">
              <Input name="bestPurchaseDay" type="number" min={1} max={31} defaultValue={9} />
            </Field>
          </div>

          <label className="flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm">
            <input name="active" type="checkbox" defaultChecked className="h-4 w-4 accent-emerald-700" />
            Cartao ativo para novos lancamentos
          </label>

          <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
            <Button type="submit" className="h-11 bg-emerald-700 hover:bg-emerald-800">
              Salvar cartao
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
