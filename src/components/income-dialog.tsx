"use client";

import { Plus, Wallet } from "lucide-react";

import { createIncomeAction } from "@/lib/actions";
import { dateInputValue } from "@/lib/format";
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
  color?: string;
};

export function IncomeDialog({ members }: { members: MemberOption[] }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" className="bg-emerald-700 text-white shadow-md hover:bg-emerald-800" />}>
        <Plus className="h-4 w-4" />
        Nova renda
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-2rem)] overflow-hidden rounded-2xl p-0 sm:max-w-xl">
        <div className="bg-gradient-to-br from-emerald-700 to-blue-700 px-6 py-5 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-white/15">
                <Wallet className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-xl text-white">Cadastrar renda</DialogTitle>
                <DialogDescription className="text-blue-50">
                  Registre entradas fixas ou variaveis e acompanhe o status mensal.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form action={createIncomeAction} className="grid gap-5 p-6">
          <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
            <Field label="Descricao">
              <Input name="description" placeholder="Rodrigo PJ" required />
            </Field>
            <Field label="Valor">
              <Input name="value" type="number" step="0.01" placeholder="0,00" required />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tipo">
              <select name="type" className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="FIXED">Fixa</option>
                <option value="VARIABLE">Variavel</option>
              </select>
            </Field>
            <Field label="Responsavel">
              <select name="responsibleId" className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data de recebimento">
              <Input name="receivedAt" type="date" defaultValue={dateInputValue()} />
            </Field>
            <Field label="Status">
              <select name="status" className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="EXPECTED">Previsto</option>
                <option value="RECEIVED">Recebido</option>
              </select>
            </Field>
          </div>

          <label className="flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm">
            <input name="recurring" type="checkbox" defaultChecked className="h-4 w-4 accent-emerald-700" />
            Recorrente mensal
          </label>

          <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
            <Button type="submit" className="h-11 bg-emerald-700 hover:bg-emerald-800">
              Salvar renda
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
