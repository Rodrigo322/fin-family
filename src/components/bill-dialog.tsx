"use client";

import type { ReactElement } from "react";
import { CalendarCheck, Edit3, Plus } from "lucide-react";

import { createBillAction, updateBillAction } from "@/lib/actions";
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
import { Textarea } from "@/components/ui/textarea";

type Option = {
  id: string;
  name: string;
  type?: string;
};

export type BillFormData = {
  id: string;
  name: string;
  value: number;
  categoryId: string;
  responsibleId: string;
  dueDate: string;
  recurring: boolean;
  frequency: string | null;
  status: string;
  notes: string | null;
};

const selectClass =
  "h-10 rounded-md border border-input bg-background px-3 text-sm transition-colors outline-none hover:border-emerald-300 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function BillDialog({
  members,
  categories,
  bill,
  trigger,
}: {
  members: Option[];
  categories: Option[];
  bill?: BillFormData;
  trigger?: ReactElement;
}) {
  const expenseCategories = categories.filter((category) => category.type === "EXPENSE");
  const isEditing = Boolean(bill);
  const action = isEditing ? updateBillAction : createBillAction;

  return (
    <Dialog>
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : (
        <DialogTrigger
          render={
            <Button
              type="button"
              className="bg-emerald-700 text-white shadow-md hover:bg-emerald-800 focus-visible:ring-emerald-700/30"
            />
          }
        >
          <>
            <Plus className="h-4 w-4" />
            Nova conta
          </>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[92dvh] max-w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-0 sm:max-w-2xl">
        <div className="bg-gradient-to-br from-emerald-700 to-sky-700 px-6 py-5 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-white/15">
                {isEditing ? <Edit3 className="h-5 w-5" /> : <CalendarCheck className="h-5 w-5" />}
              </span>
              <div>
                <DialogTitle className="text-xl text-white">
                  {isEditing ? "Editar conta" : "Cadastrar conta"}
                </DialogTitle>
                <DialogDescription className="text-blue-50">
                  Ajuste valor, responsavel, vencimento, recorrencia e status da conta.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form action={action} className="grid gap-5 p-6">
          {bill ? <input type="hidden" name="id" value={bill.id} /> : null}
          <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
            <Field label="Nome da conta">
              <Input name="name" placeholder="Internet fibra" defaultValue={bill?.name} required />
            </Field>
            <Field label="Valor">
              <Input name="value" type="number" step="0.01" placeholder="0,00" defaultValue={bill?.value} required />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Categoria">
              <select name="categoryId" className={selectClass} defaultValue={bill?.categoryId}>
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Responsavel">
              <select name="responsibleId" className={selectClass} defaultValue={bill?.responsibleId}>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Vencimento">
              <Input name="dueDate" type="date" defaultValue={bill?.dueDate ?? dateInputValue()} />
            </Field>
            <Field label="Frequencia">
              <select name="frequency" className={selectClass} defaultValue={bill?.frequency ?? ""}>
                <option value="">Sem recorrencia</option>
                <option value="MONTHLY">Mensal</option>
                <option value="WEEKLY">Semanal</option>
                <option value="YEARLY">Anual</option>
              </select>
            </Field>
            <Field label="Status">
              <select name="status" className={selectClass} defaultValue={bill?.status ?? "PENDING"}>
                <option value="PENDING">Pendente</option>
                <option value="PAID">Paga</option>
                <option value="OVERDUE">Atrasada</option>
              </select>
            </Field>
          </div>

          <Field label="Observacao">
            <Textarea
              name="notes"
              placeholder="Detalhes opcionais, combinados ou observacoes da conta."
              defaultValue={bill?.notes ?? ""}
            />
          </Field>

          <label className="flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm transition hover:border-emerald-200 hover:bg-emerald-50 focus-within:ring-3 focus-within:ring-ring/40">
            <input
              name="recurring"
              type="checkbox"
              defaultChecked={bill?.recurring}
              className="h-4 w-4 accent-emerald-700"
            />
            Esta conta se repete
          </label>

          <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
            <Button type="submit" className="h-11 bg-emerald-700 hover:bg-emerald-800">
              {isEditing ? "Salvar alteracoes" : "Salvar conta"}
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
