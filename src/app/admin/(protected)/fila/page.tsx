import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayISODate } from "@/lib/tapronto/format";
import { FilaBoard } from "@/components/admin/FilaBoard";

export const dynamic = "force-dynamic";

export default async function FilaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("tenant_id")
    .eq("user_id", user.id)
    .single();
  if (!profile) redirect("/admin/login");

  const pickupDate = todayISODate();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, pickup_window_templates(start_time, end_time)")
    .eq("tenant_id", profile.tenant_id)
    .eq("pickup_date", pickupDate)
    .order("ticket_number", { ascending: true });

  return (
    <div>
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brasa">
        Hoje · {pickupDate.split("-").reverse().join("/")}
      </p>
      <h1 className="mt-2 font-display text-3xl">Fila de pedidos</h1>

      <div className="mt-8">
        <FilaBoard tenantId={profile.tenant_id} initialOrders={orders ?? []} />
      </div>
    </div>
  );
}
