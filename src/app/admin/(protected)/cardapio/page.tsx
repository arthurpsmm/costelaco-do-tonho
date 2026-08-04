import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CardapioAdmin } from "@/components/admin/CardapioAdmin";

export const dynamic = "force-dynamic";

export default async function CardapioAdminPage() {
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

  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  return (
    <div>
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brasa">
        Cardápio
      </p>
      <h1 className="mt-2 font-display text-3xl">Itens e preços</h1>
      <p className="mt-2 max-w-lg text-foreground-soft">
        Editar aqui atualiza o site e o pedido na hora — não precisa mexer no banco.
      </p>

      <div className="mt-8">
        <CardapioAdmin tenantId={profile.tenant_id} initialItems={items ?? []} />
      </div>
    </div>
  );
}
