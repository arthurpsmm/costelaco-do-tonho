import { createClient } from "@/lib/supabase/server";
import { TENANT_SLUG } from "./config";

export async function getTenant() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id, slug, name, timezone")
    .eq("slug", TENANT_SLUG)
    .single();

  if (error || !data) {
    throw new Error(`Tenant "${TENANT_SLUG}" não encontrado no banco. Rode supabase/seed.sql.`);
  }
  return data;
}

export async function getMenu(tenantId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return {
    marmitas: data.filter((i) => i.category === "marmita"),
    cutlery: data.find((i) => i.category === "addon_cutlery") ?? null,
    drinks: data.filter((i) => i.category === "addon_drink"),
  };
}

export async function getPickupWindows(tenantId: string, pickupDate: string) {
  const supabase = await createClient();

  const [{ data: templates, error: templatesError }, { data: orders, error: ordersError }] =
    await Promise.all([
      supabase
        .from("pickup_window_templates")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("orders")
        .select("pickup_window_template_id")
        .eq("tenant_id", tenantId)
        .eq("pickup_date", pickupDate)
        .neq("status", "cancelado"),
    ]);

  if (templatesError) throw templatesError;
  if (ordersError) throw ordersError;

  const takenByWindow = new Map<string, number>();
  for (const order of orders ?? []) {
    const id = order.pickup_window_template_id;
    takenByWindow.set(id, (takenByWindow.get(id) ?? 0) + 1);
  }

  return (templates ?? []).map((template) => {
    const taken = takenByWindow.get(template.id) ?? 0;
    return {
      ...template,
      taken,
      remaining: Math.max(template.capacity - taken, 0),
    };
  });
}
