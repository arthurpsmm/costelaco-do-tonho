import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusView } from "@/components/pedido/OrderStatusView";

export const dynamic = "force-dynamic";

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, pickup_window_templates(start_time, end_time)")
    .eq("id", id)
    .single();

  if (error || !order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
      <OrderStatusView initialOrder={order} />
    </div>
  );
}
