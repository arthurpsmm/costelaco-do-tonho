"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCents } from "@/lib/tapronto/format";
import { customerWhatsappLink, readyMessage } from "@/lib/tapronto/notify";
import type { OrderItemSnapshot, OrderStatus } from "@/lib/supabase/types";

type OrderRow = {
  id: string;
  ticket_number: number | null;
  customer_name: string;
  customer_phone: string;
  status: OrderStatus;
  items: OrderItemSnapshot[];
  notes: string | null;
  total_cents: number;
  pickup_window_templates: { start_time: string; end_time: string } | null;
};

const columns: { key: OrderStatus; label: string; next: OrderStatus | null }[] = [
  { key: "recebido", label: "Recebido", next: "em_preparo" },
  { key: "em_preparo", label: "Em preparo", next: "pronto" },
  { key: "pronto", label: "Pronto", next: "entregue" },
  { key: "entregue", label: "Entregue", next: null },
];

export function FilaBoard({ tenantId, initialOrders }: { tenantId: string; initialOrders: OrderRow[] }) {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`fila-${tenantId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `tenant_id=eq.${tenantId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [...prev, payload.new as OrderRow]);
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? { ...o, ...(payload.new as Partial<OrderRow>) } : o))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  async function advance(orderId: string, next: OrderStatus) {
    const supabase = createClient();
    await supabase.from("orders").update({ status: next }).eq("id", orderId);
  }

  async function cancelOrder(orderId: string) {
    if (!window.confirm("Cancelar este pedido? A vaga do horário volta a ficar disponível.")) return;
    const supabase = createClient();
    await supabase.from("orders").update({ status: "cancelado" }).eq("id", orderId);
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {columns.map((col) => {
        const items = orders
          .filter((o) => o.status === col.key)
          .sort((a, b) => (a.ticket_number ?? 0) - (b.ticket_number ?? 0));

        return (
          <div key={col.key} className="rounded-2xl border border-line bg-card p-4">
            <h2 className="font-sans text-sm font-semibold uppercase tracking-wide text-foreground-soft">
              {col.label} <span className="text-brasa">({items.length})</span>
            </h2>
            <div className="mt-3 space-y-3">
              {items.map((order) => (
                <div key={order.id} className="rounded-xl border border-line bg-background p-3">
                  <div className="flex items-baseline justify-between font-sans">
                    <span className="text-lg font-bold">#{order.ticket_number}</span>
                    <span className="text-xs text-foreground-soft">
                      {order.pickup_window_templates?.start_time.slice(0, 5)}
                    </span>
                  </div>
                  <p className="mt-1 font-sans text-sm font-medium">{order.customer_name}</p>
                  <ul className="mt-1 font-sans text-xs text-foreground-soft">
                    {order.items.map((item, i) => (
                      <li key={i}>
                        {item.name}
                        {item.proteins && item.proteins.length > 0 ? ` (${item.proteins.join(", ")})` : ""}
                      </li>
                    ))}
                  </ul>
                  {order.notes && (
                    <p className="mt-1 font-sans text-xs italic text-foreground-soft">&quot;{order.notes}&quot;</p>
                  )}
                  <p className="mt-1 font-sans text-xs font-semibold tabular-nums">
                    {formatCents(order.total_cents)}
                  </p>

                  {col.key === "pronto" && (
                    <a
                      href={customerWhatsappLink(order.customer_phone, readyMessage(order.customer_name, order.ticket_number))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block w-full rounded-full bg-[#25D366] px-3 py-1.5 text-center font-sans text-xs font-semibold text-white hover:opacity-90"
                    >
                      Avisar no WhatsApp
                    </a>
                  )}

                  {col.next && (
                    <button
                      onClick={() => advance(order.id, col.next!)}
                      className="mt-2 w-full rounded-full bg-brasa px-3 py-1.5 font-sans text-xs font-semibold text-white hover:bg-brasa-deep"
                    >
                      Avançar →
                    </button>
                  )}

                  {col.key !== "entregue" && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="mt-1.5 w-full rounded-full border border-line px-3 py-1.5 font-sans text-xs font-medium text-foreground-soft hover:border-brasa hover:text-brasa"
                    >
                      Cancelar pedido
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
