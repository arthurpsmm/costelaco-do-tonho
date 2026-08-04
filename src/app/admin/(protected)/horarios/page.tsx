import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HorariosAdmin } from "@/components/admin/HorariosAdmin";

export const dynamic = "force-dynamic";

export default async function HorariosAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .single();
  if (!profile) redirect("/admin/login");
  if (profile.role !== "owner") redirect("/admin/fila");

  const { data: windows } = await supabase
    .from("pickup_window_templates")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brasa">
        Configuração
      </p>
      <h1 className="mt-2 font-display text-3xl">Horários e capacidade</h1>
      <p className="mt-2 max-w-lg text-foreground-soft">
        Quantas marmitas cabem em cada janela de 15 minutos — isso é o que trava a
        fila de verdade no pedido.
      </p>

      <div className="mt-8">
        <HorariosAdmin tenantId={profile.tenant_id} initialWindows={windows ?? []} />
      </div>
    </div>
  );
}
