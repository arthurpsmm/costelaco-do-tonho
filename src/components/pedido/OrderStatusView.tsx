"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCents } from "@/lib/tapronto/format";
import type { OrderItemSnapshot, OrderStatus } from "@/lib/supabase/types";

type OrderWithWindow = {
  id: string;
  ticket_number: number | null;
  customer_name: string;
  status: OrderStatus;
  items: OrderItemSnapshot[];
  notes: string | null;
  total_cents: number;
  pickup_date: string;
  pickup_window_templates: { start_time: string; end_time: string } | null;
};

const steps: { key: OrderStatus; label: string }[] = [
  { key: "recebido", label: "Recebido" },
  { key: "em_preparo", label: "Em preparo" },
  { key: "pronto", label: "Pronto" },
  { key: "entregue", label: "Entregue" },
];

export function OrderStatusView({ initialOrder }: { initialOrder: OrderWithWindow }) {
  const [order, setOrder] = useState(initialOrder);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`order-${initialOrder.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${initialOrder.id}` },
        (payload) => {
          setOrder((prev) => ({ ...prev, ...(payload.new as Partial<OrderWithWindow>) }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialOrder.id]);

  const cancelled = order.status === "cancelado";
  const currentIndex = steps.findIndex((s) => s.key === order.status);
  const win = order.pickup_window_templates;

  return (
    <div>
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brasa">
        Acompanhe seu pedido
      </p>
      <h1 className="mt-2 font-display text-4xl">
        Senha {order.ticket_number ?? "—"}
      </h1>
      <p className="mt-2 text-foreground-soft">
        {order.customer_name} · retirada {win ? `${win.start_time.slice(0, 5)} – ${win.end_time.slice(0, 5)}` : ""}
      </p>

      {cancelled ? (
        <div className="mt-8 rounded-2xl border border-brasa/40 bg-card p-6 text-brasa">
          Este pedido foi cancelado. Qualquer dúvida, chama no WhatsApp do restaurante.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-4 gap-2">
          {steps.map((step, i) => (
            <div key={step.key} className="text-center">
              <div
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full font-sans text-sm font-semibold ${
                  i <= currentIndex ? "bg-brasa text-white" : "border border-line bg-card text-foreground-soft"
                }`}
              >
                {i + 1}
              </div>
              <p className={`mt-2 font-sans text-xs ${i <= currentIndex ? "text-foreground" : "text-foreground-soft"}`}>
                {step.label}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-display text-lg">Resumo</h2>
        <ul className="mt-3 space-y-2 font-sans text-sm">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-4 border-b border-dotted border-line py-2 last:border-0">
              <span>
                {item.name}
                {item.proteins && item.proteins.length > 0 && (
                  <span className="block text-xs text-foreground-soft">{item.proteins.join(" + ")}</span>
                )}
              </span>
              <span className="tabular-nums text-foreground-soft">{formatCents(item.price_cents)}</span>
            </li>
          ))}
        </ul>
        {order.notes && (
          <p className="mt-3 text-sm text-foreground-soft">Observação: {order.notes}</p>
        )}
        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3 font-sans">
          <span className="text-sm font-medium">Total</span>
          <span className="text-lg font-semibold tabular-nums">{formatCents(order.total_cents)}</span>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-foreground-soft">
        Essa página atualiza sozinha — não precisa perguntar se já está pronto.
      </p>
    </div>
  );
}
