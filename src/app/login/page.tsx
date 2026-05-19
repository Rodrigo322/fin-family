import Link from "next/link";
import { ArrowRight, Eye, Lock, Mail, Users } from "lucide-react";

import { loginAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const error = Array.isArray(searchParams.error) ? searchParams.error[0] : searchParams.error;
  const errorMessage =
    error === "invalid"
      ? "E-mail ou senha invalidos."
      : error?.startsWith("google")
        ? "Nao foi possivel entrar com Google. Confira a configuracao e tente novamente."
        : null;

  return (
    <main className="grid min-h-dvh overflow-x-hidden overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-slate-50 px-4 py-4 sm:px-6 lg:h-dvh lg:grid-cols-[minmax(520px,1fr)_minmax(380px,520px)] lg:items-center lg:gap-8 lg:overflow-hidden lg:px-10 lg:py-4 xl:px-24">
      <section className="mx-auto hidden max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-hidden lg:block">
        <div className="flex items-center gap-3 text-emerald-800">
          <Users className="h-8 w-8 shrink-0 xl:h-10 xl:w-10 [@media(max-height:760px)]:h-7 [@media(max-height:760px)]:w-7" />
          <span className="text-3xl font-bold xl:text-5xl [@media(max-height:760px)]:text-4xl">Controle Familiar</span>
        </div>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal text-slate-950 xl:mt-8 xl:text-5xl [@media(max-height:760px)]:mt-4 [@media(max-height:760px)]:text-4xl">
          Controle seus gastos de forma simples
        </h1>
        <p className="mt-3 max-w-xl text-lg leading-7 text-slate-600 xl:mt-5 xl:text-2xl xl:leading-9 [@media(max-height:760px)]:mt-2 [@media(max-height:760px)]:text-lg [@media(max-height:760px)]:leading-7">
          Transforme a gestao financeira da sua casa em um momento de uniao. Simples, transparente e feito para a vida real.
        </p>

        <div className="mt-5 aspect-[16/9] max-h-[34dvh] min-h-44 overflow-hidden rounded-lg border border-emerald-100 bg-[#f7d9a8] shadow-xl xl:mt-8 xl:max-h-[360px] [@media(max-height:760px)]:mt-4 [@media(max-height:760px)]:max-h-[28dvh] [@media(max-height:760px)]:min-h-0">
          <div className="relative h-full w-full bg-[linear-gradient(135deg,#fff7d6_0%,#fed7aa_45%,#bae6fd_100%)]">
            <div className="absolute inset-x-0 bottom-0 h-24 bg-[#9a6a46]" />
            <div className="absolute left-[9%] top-[18%] h-[52%] w-[24%] rounded-t-full bg-emerald-800 shadow-lg">
              <div className="absolute left-[26%] top-[-17%] h-[30%] w-[42%] rounded-full bg-[#c48a62]" />
              <div className="absolute right-[-18%] top-[28%] h-[24%] w-[38%] rotate-[-18deg] rounded-full bg-[#c48a62]" />
            </div>
            <div className="absolute left-[33%] top-[35%] h-[42%] w-[18%] rounded-t-full bg-orange-300 shadow-lg">
              <div className="absolute left-[25%] top-[-23%] h-[35%] w-[50%] rounded-full bg-[#b87654]" />
              <div className="absolute inset-x-[18%] top-[-28%] h-[22%] rounded-t-full bg-[#3f261f]" />
            </div>
            <div className="absolute right-[13%] top-[20%] h-[55%] w-[24%] rounded-t-full bg-lime-200 shadow-lg">
              <div className="absolute left-[28%] top-[-17%] h-[30%] w-[42%] rounded-full bg-[#c98f68]" />
              <div className="absolute inset-x-[8%] top-[-25%] h-[30%] rounded-t-full bg-[#4a2a2a]" />
            </div>
            <div className="absolute left-[33%] bottom-[16%] h-[26%] w-[34%] rounded-md bg-slate-800 shadow-2xl">
              <div className="absolute inset-x-[7%] top-[12%] h-[70%] rounded bg-slate-700" />
              <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900" />
            </div>
            <div className="absolute left-[6%] top-[10%] h-20 w-20 rounded-full bg-white/40 blur-2xl" />
            <div className="absolute right-[8%] top-[8%] h-24 w-24 rounded-full bg-white/35 blur-2xl" />
          </div>
        </div>

        <div className="mt-4 grid max-w-xl grid-cols-3 gap-3 xl:mt-6 [@media(max-height:760px)]:hidden">
          <div className="rounded-lg border border-emerald-100 bg-white/80 p-3 shadow-sm">
            <p className="text-xs text-slate-500">Renda familiar</p>
            <strong className="text-lg text-emerald-800">R$ 5.950</strong>
          </div>
          <div className="rounded-lg border border-blue-100 bg-white/80 p-3 shadow-sm">
            <p className="text-xs text-slate-500">Contas proximas</p>
            <strong className="text-lg text-blue-700">7</strong>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-white/80 p-3 shadow-sm">
            <p className="text-xs text-slate-500">Saldo estimado</p>
            <strong className="text-lg text-emerald-800">OK</strong>
          </div>
        </div>
      </section>

      <section className="flex min-h-0 items-center justify-center">
        <Card className="w-full max-w-md overflow-hidden rounded-2xl border-slate-200 bg-white/95 shadow-2xl lg:max-h-[calc(100dvh-2rem)]">
          <CardHeader className="space-y-1 px-5 pb-3 pt-5 sm:px-8 sm:pt-8 [@media(max-height:760px)]:pb-2 [@media(max-height:760px)]:pt-5">
            <div className="mb-2 flex items-center gap-2 text-emerald-800 lg:hidden">
              <Users className="h-6 w-6" />
              <span className="text-xl font-bold">Controle Familiar</span>
            </div>
            <CardTitle className="text-2xl sm:text-3xl">Bem-vindo de volta</CardTitle>
            <CardDescription>Acesse o seu hub financeiro familiar.</CardDescription>
            {errorMessage ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p> : null}
          </CardHeader>
          <div className="px-5 pb-4 sm:px-8 [@media(max-height:760px)]:pb-3">
            <Button asChild variant="outline" className="h-12 w-full rounded-xl border-slate-200 bg-white text-base text-slate-800 hover:bg-slate-50 [@media(max-height:760px)]:h-11">
              <Link href="/api/auth/google" aria-label="Entrar com sua conta Google">
                <span className="flex size-6 items-center justify-center rounded-full bg-white font-semibold text-blue-600 shadow-sm ring-1 ring-slate-200">
                  G
                </span>
                Entrar com Google
              </Link>
            </Button>
            <div className="mt-4 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400 [@media(max-height:760px)]:mt-3">
              <span className="h-px flex-1 bg-slate-200" />
              ou
              <span className="h-px flex-1 bg-slate-200" />
            </div>
          </div>
          <form action={loginAction}>
            <CardContent className="grid gap-4 px-5 sm:px-8 [@media(max-height:760px)]:gap-3">
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <Input id="email" name="email" type="email" placeholder="nome@email.com" className="h-14 rounded-xl pl-14 text-base [@media(max-height:760px)]:h-12" required />
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link href="/login" className="text-sm font-medium text-blue-700 hover:text-blue-800 focus-visible:rounded-sm">
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <Input id="password" name="password" type="password" placeholder="********" className="h-14 rounded-xl px-14 text-base [@media(max-height:760px)]:h-12" required />
                  <Eye className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
              <label className="flex items-center gap-3 text-sm text-slate-600">
                <Checkbox name="remember" />
                Lembrar neste dispositivo
              </label>
              <Button type="submit" className="h-14 rounded-xl bg-emerald-700 text-base hover:bg-emerald-800 [@media(max-height:760px)]:h-12">
                Entrar
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </form>
          <CardFooter className="justify-center border-t bg-blue-50/70 p-4 [@media(max-height:760px)]:p-3">
            <span className="text-sm text-slate-600">
              Novo por aqui?{" "}
              <Link href="/register" className="font-semibold text-blue-700 hover:text-blue-800 focus-visible:rounded-sm">
                Criar conta
              </Link>
            </span>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
