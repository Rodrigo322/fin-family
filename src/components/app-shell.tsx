"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarClock,
  CreditCard,
  FolderKanban,
  Home,
  LogOut,
  Menu,
  Plus,
  Receipt,
  Settings,
  Tags,
  Users,
  Wallet,
} from "lucide-react";

import { logoutAction } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/expenses", label: "Gastos", icon: Receipt },
  { href: "/incomes", label: "Rendas", icon: Wallet },
  { href: "/credit-cards", label: "Cartoes", icon: CreditCard },
  { href: "/invoices", label: "Faturas", icon: CalendarClock },
  { href: "/bills", label: "Contas", icon: FolderKanban },
  { href: "/upcoming", label: "Proximas", icon: Bell },
  { href: "/categories", label: "Categorias", icon: Tags },
  { href: "/family", label: "Familia", icon: Users },
  { href: "/reports", label: "Relatorios", icon: BarChart3 },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1">
      {navigation.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            href={item.href}
            key={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={item.label}
            className={cn(
              "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:bg-blue-50 focus-visible:text-blue-700",
              active && "bg-blue-600 text-white shadow-sm hover:bg-blue-600 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  userName,
  familyName,
}: {
  children: React.ReactNode;
  userName: string;
  familyName: string;
}) {
  const pathname = usePathname();
  const current = navigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-blue-100 bg-blue-50/70 px-5 py-6 lg:flex">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-3" title="Ir para o dashboard">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-emerald-600 text-white">
              <Users className="h-5 w-5" />
            </span>
            <span>
              <strong className="block text-xl text-emerald-800">Controle Familiar</strong>
              <span className="text-sm text-slate-600">{familyName}</span>
            </span>
          </Link>

          <div className="mt-8 min-h-0 flex-1 overflow-y-auto pr-1">
            <NavList />
          </div>

          <div className="mt-4 shrink-0 space-y-3">
            <Button asChild className="h-12 w-full bg-emerald-700 text-white shadow-md hover:bg-emerald-800">
              <Link href="/expenses/new">
                <Plus className="h-4 w-4" />
                Lançar gasto
              </Link>
            </Button>
            <Separator />
            <form action={logoutAction}>
              <Button variant="ghost" className="w-full justify-start text-slate-700">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </form>
          </div>
        </aside>

        <div className="lg:pl-72">
          <header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-slate-200 bg-slate-50/90 px-4 backdrop-blur lg:px-8">
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Abrir menu"
                  />
                }
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-blue-50 p-5">
                <SheetTitle className="mb-6 text-left text-emerald-800">Controle Familiar</SheetTitle>
                <NavList />
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold text-emerald-800 lg:text-2xl">
                {current?.label ?? "Controle Familiar"}
              </h1>
            </div>

            <div className="hidden w-full max-w-xs items-center rounded-full bg-blue-100 px-3 md:flex">
              <Input
                className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
                aria-label="Buscar nas financas"
                placeholder="Buscar nas finanças..."
              />
            </div>

            <Button variant="ghost" size="icon" aria-label="Notificacoes">
              <Bell className="h-5 w-5 text-emerald-800" />
            </Button>
            <Avatar className="h-10 w-10 border border-emerald-200">
              <AvatarFallback className="bg-emerald-100 text-emerald-800">{initials(userName)}</AvatarFallback>
            </Avatar>
          </header>

          <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 lg:px-8">{children}</main>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white px-2 py-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] lg:hidden">
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={item.label}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[11px] text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:bg-emerald-50 focus-visible:text-emerald-800",
                  active && "bg-emerald-50 text-emerald-800",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </TooltipProvider>
  );
}
