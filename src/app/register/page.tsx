import Link from "next/link";
import { ArrowRight, Home, Mail, ShieldCheck, UserRound, Users } from "lucide-react";

import { registerAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function RegisterPage(props: PageProps<"/register">) {
  const searchParams = await props.searchParams;
  const error = Array.isArray(searchParams.error) ? searchParams.error[0] : searchParams.error;
  const exists = error === "exists";

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-6 py-10">
      <Card className="w-full max-w-2xl rounded-2xl border-blue-100 shadow-xl">
        <CardHeader>
          <div className="mb-3 flex items-center gap-3 text-emerald-800">
            <Users className="h-8 w-8" />
            <span className="text-2xl font-bold">Controle Familiar</span>
          </div>
          <CardTitle className="text-3xl">Criar família financeira</CardTitle>
          <CardDescription>
            O cadastro cria a familia, perfis do casal, categorias padrão e as rendas iniciais de R$ 5.950,00.
          </CardDescription>
          {exists ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Este e-mail ja esta cadastrado.</p> : null}
        </CardHeader>
        <div className="px-6 pb-4">
          <Button asChild variant="outline" className="h-12 w-full rounded-xl border-slate-200 bg-white text-base text-slate-800 hover:bg-slate-50">
            <Link href="/api/auth/google" aria-label="Criar conta usando Google">
              <span className="flex size-6 items-center justify-center rounded-full bg-white font-semibold text-blue-600 shadow-sm ring-1 ring-slate-200">
                G
              </span>
              Criar com Google
            </Link>
          </Button>
          <div className="mt-4 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            ou preencher dados
            <span className="h-px flex-1 bg-slate-200" />
          </div>
        </div>
        <form action={registerAction}>
          <CardContent className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Seu nome" icon={<UserRound className="h-4 w-4" />}>
                <Input name="name" placeholder="Rodrigo" required />
              </Field>
              <Field label="Nome da esposa" icon={<UserRound className="h-4 w-4" />}>
                <Input name="spouseName" placeholder="Esposa" />
              </Field>
            </div>
            <Field label="Nome da família" icon={<Home className="h-4 w-4" />}>
              <Input name="familyName" placeholder="Família Rodrigo" required />
            </Field>
            <Field label="E-mail" icon={<Mail className="h-4 w-4" />}>
              <Input name="email" type="email" placeholder="rodrigo@email.com" required />
            </Field>
            <Field label="Senha" icon={<ShieldCheck className="h-4 w-4" />}>
              <Input name="password" type="password" minLength={6} placeholder="minimo 6 caracteres" required />
            </Field>
            <Button className="h-12 bg-emerald-700 text-base hover:bg-emerald-800">
              Criar conta
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-center text-sm text-slate-600">
              Ja tem conta?{" "}
              <Link href="/login" className="font-semibold text-blue-700">
                Entrar
              </Link>
            </p>
          </CardContent>
        </form>
      </Card>
    </main>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
        <div className="[&_input]:pl-10">{children}</div>
      </div>
    </div>
  );
}
