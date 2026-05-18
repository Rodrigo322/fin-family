import { Database, ShieldCheck } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-4xl font-semibold">Ajustes</h2>
        <p className="text-slate-600">Configuração da família, conta e deploy.</p>
      </div>

      <Tabs defaultValue="account" className="grid gap-6">
        <TabsList className="w-fit">
          <TabsTrigger value="account">Conta</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card className="rounded-lg border-blue-100 shadow-sm">
            <CardHeader>
              <ShieldCheck className="h-6 w-6 text-emerald-700" />
              <CardTitle>Dados da conta</CardTitle>
              <CardDescription>Sessão persistente com senha criptografada por bcrypt.</CardDescription>
            </CardHeader>
            <CardContent className="grid max-w-xl gap-4">
              <Field label="Nome"><Input value={user.name} readOnly /></Field>
              <Field label="E-mail"><Input value={user.email} readOnly /></Field>
              <Field label="Família"><Input value={user.family.name} readOnly /></Field>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="deploy">
          <Card className="rounded-lg border-blue-100 shadow-sm">
            <CardHeader>
              <Database className="h-6 w-6 text-blue-700" />
              <CardTitle>Banco e Vercel</CardTitle>
              <CardDescription>
                Use `DATABASE_URL` de Neon, Supabase ou PostgreSQL proprio e `AUTH_SECRET` como segredo longo.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-slate-700">
              <code className="rounded-md bg-slate-100 p-3">npm run prisma:migrate</code>
              <code className="rounded-md bg-slate-100 p-3">npm run db:seed</code>
              <code className="rounded-md bg-slate-100 p-3">npm run build</code>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}
