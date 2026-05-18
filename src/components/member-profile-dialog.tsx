"use client";

import { Pencil, Plus, Sparkles, UserRound } from "lucide-react";

import { createMemberAction, updateMemberAction } from "@/lib/actions";
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

type MemberProfile = {
  id: string;
  name: string;
  label: string | null;
  color: string;
};

export function MemberProfileDialog({
  member,
  variant = "button",
}: {
  member?: MemberProfile;
  variant?: "button" | "icon";
}) {
  const isEditing = Boolean(member);
  const action = isEditing ? updateMemberAction : createMemberAction;

  return (
    <Dialog>
      <DialogTrigger
        render={
          variant === "icon" ? (
            <Button type="button" variant="outline" size="icon" aria-label="Editar perfil" />
          ) : (
            <Button type="button" className="bg-emerald-700 text-white shadow-md hover:bg-emerald-800" />
          )
        }
      >
        {variant === "icon" ? (
          <Pencil className="h-4 w-4" />
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Novo perfil
          </>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[calc(100%-2rem)] overflow-hidden rounded-2xl p-0 sm:max-w-lg">
        <div className="bg-gradient-to-br from-emerald-700 to-blue-700 px-6 py-5 text-white">
          <DialogHeader className="gap-2">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-white/15">
                {isEditing ? <Pencil className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
              </span>
              <div>
                <DialogTitle className="text-xl text-white">
                  {isEditing ? "Editar perfil familiar" : "Novo perfil familiar"}
                </DialogTitle>
                <DialogDescription className="text-blue-50">
                  {isEditing
                    ? "Atualize nome, papel e cor de identificacao no sistema."
                    : "Crie um responsavel para rendas, gastos, contas ou cartoes."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form action={action} className="grid gap-5 p-6">
          {member ? <input type="hidden" name="id" value={member.id} /> : null}

          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <span
                className="grid h-12 w-12 place-items-center rounded-md text-lg font-semibold text-white shadow-sm"
                style={{ background: member?.color ?? "#047857" }}
              >
                {(member?.name ?? "P")[0]}
              </span>
              <div>
                <p className="font-medium">{member?.name ?? "Perfil da familia"}</p>
                <p className="text-sm text-slate-600">{member?.label ?? "Responsavel financeiro"}</p>
              </div>
            </div>
          </div>

          <Field label="Nome do perfil">
            <Input name="name" defaultValue={member?.name ?? ""} placeholder="Ex: Esposa" required />
          </Field>

          <Field label="Papel na familia">
            <Input name="label" defaultValue={member?.label ?? ""} placeholder="Ex: Co-responsavel, esposa, reserva" />
          </Field>

          <Field label="Cor de identificacao">
            <div className="grid grid-cols-[72px_1fr] gap-3">
              <Input name="color" type="color" defaultValue={member?.color ?? "#047857"} className="h-11 p-1" />
              <div className="flex items-center gap-2 rounded-md border border-blue-100 bg-slate-50 px-3 text-sm text-slate-600">
                <Sparkles className="h-4 w-4 text-emerald-700" />
                Essa cor aparece nos cards e relatorios por pessoa.
              </div>
            </div>
          </Field>

          <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
            <Button type="submit" className="h-11 bg-emerald-700 hover:bg-emerald-800">
              {isEditing ? "Salvar alteracoes" : "Criar perfil"}
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
