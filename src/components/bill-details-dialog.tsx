"use client";

import type { ReactNode } from "react";
import { CalendarDays, CircleDollarSign, Eye, Repeat2, UserRound } from "lucide-react";

import type { BillFormData } from "@/components/bill-dialog";
import { money } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export type BillDetailsData = BillFormData & {
  categoryName: string;
  responsibleName: string;
  dueDateLabel: string;
};

const frequencyLabels: Record<string, string> = {
  MONTHLY: "Mensal",
  WEEKLY: "Semanal",
  YEARLY: "Anual",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Paga",
  OVERDUE: "Atrasada",
};

export function BillDetailsDialog({ bill }: { bill: BillDetailsData }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`Abrir detalhes de ${bill.name}`}
            title={`Abrir detalhes de ${bill.name}`}
          />
        }
      >
        <Eye className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] max-w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-0 sm:max-w-xl">
        <div className="bg-gradient-to-br from-blue-700 to-emerald-700 px-6 py-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">{bill.name}</DialogTitle>
            <DialogDescription className="text-blue-50">
              Detalhes da conta, responsavel, vencimento e status atual.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid gap-5 p-6">
          <div className="flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-600">Valor da conta</p>
              <p className="text-3xl font-semibold text-emerald-800">{money(bill.value)}</p>
            </div>
            <Badge variant="secondary" className="w-fit">
              {statusLabels[bill.status] ?? bill.status}
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Detail icon={<CalendarDays className="h-4 w-4" />} label="Vencimento" value={bill.dueDateLabel} />
            <Detail icon={<CircleDollarSign className="h-4 w-4" />} label="Categoria" value={bill.categoryName} />
            <Detail icon={<UserRound className="h-4 w-4" />} label="Responsavel" value={bill.responsibleName} />
            <Detail
              icon={<Repeat2 className="h-4 w-4" />}
              label="Recorrencia"
              value={bill.recurring ? frequencyLabels[bill.frequency ?? ""] ?? "Recorrente" : "Nao recorrente"}
            />
          </div>

          <Separator />

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold text-slate-950">Observacao</h3>
            <p className="min-h-16 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
              {bill.notes || "Nenhuma observacao cadastrada."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-800">
        {icon}
      </span>
      <span>
        <span className="block text-xs text-slate-500">{label}</span>
        <strong className="block text-sm font-semibold text-slate-950">{value}</strong>
      </span>
    </div>
  );
}
