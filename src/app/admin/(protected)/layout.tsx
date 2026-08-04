import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/admin/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("full_name, role, tenant_id, tenants(name)")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    redirect("/admin/login");
  }

  const tenantName = (profile as unknown as { tenants: { name: string } | null }).tenants?.name;

  return (
    <div className="min-h-screen bg-background-raised">
      <header className="border-b border-line bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div>
            <p className="font-display text-lg">
              TaPronto <span className="text-foreground-soft">· {tenantName}</span>
            </p>
            <p className="font-sans text-xs text-foreground-soft">
              {profile.full_name} · {profile.role}
            </p>
          </div>
          <nav className="flex items-center gap-5 font-sans text-sm">
            <Link href="/admin/fila" className="hover:text-brasa">Fila</Link>
            <Link href="/admin/pedidos" className="hover:text-brasa">Pedidos</Link>
            <Link href="/admin/cardapio" className="hover:text-brasa">Cardápio</Link>
            {profile.role === "owner" && (
              <>
                <Link href="/admin/horarios" className="hover:text-brasa">Horários</Link>
                <Link href="/admin/equipe" className="hover:text-brasa">Equipe</Link>
              </>
            )}
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</main>
    </div>
  );
}
