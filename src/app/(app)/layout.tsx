import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <AppShell userName={user.name} familyName={user.family.name}>
      {children}
    </AppShell>
  );
}
